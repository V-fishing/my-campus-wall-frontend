<template>
  <view class="bg-[#fefcf5] min-h-screen">
    <!-- 顶部导航 -->
    <header class="flex items-center px-4 pt-status-bar h-20">
      <view class="bouncy-tap p-2 text-primary" @click="handleBack">
        <text class="material-symbols-outlined">arrow_back_ios</text>
      </view>
      <h1 class="flex-1 text-center font-headline-md text-primary font-bold">选择你的大学</h1>
      <view class="w-10"></view>
    </header>

    <main class="px-4 pb-8 space-y-6">
      <!-- 提示 Banner -->
      <view class="bg-gradient-to-r from-[#fff9c4] to-[#fff3e0] rounded-xxl p-4 flex items-start gap-3 border-2 border-white kawaii-shadow">
        <text class="material-symbols-outlined text-[#ef6c00]">warning</text>
        <p class="text-[26rpx] text-[#e65100]">学校信息仅能修改一次，请慎重选择。</p>
      </view>

      <!-- 搜索框 -->
      <view class="relative">
        <text class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">search</text>
        <input class="w-full h-12 bg-surface-container-low border-none rounded-full pl-12 pr-4 text-[28rpx]"
               :placeholder=" '搜索学校名称'"
               v-model="searchKeyword"
               @confirm="handleSearch" />
      </view>

      <!-- 胶囊筛选条 -->
      <view class="flex items-center gap-2 overflow-x-auto pb-2">
        <button class="px-6 py-2 rounded-full text-[26rpx] font-bold bouncy-btn shrink-0"
                :class="currentStep >= 0 ? 'gradient-primary text-white shadow-md' : 'bg-surface-container text-outline'" @click="goToStep(0)">
          {{ selectedProvince || '选择省份' }}
        </button>
        <view class="w-4 border-b border-dashed border-outline-variant"></view>
        <button class="px-6 py-2 rounded-full text-[26rpx] font-bold bouncy-btn shrink-0"
                :class="currentStep >= 1 ? 'gradient-primary text-white shadow-md' : 'bg-surface-container text-outline'" @click="goToStep(1)">
          {{ selectedCity || '选择市' }}
        </button>
        <view class="w-4 border-b border-dashed border-outline-variant"></view>
        <button class="px-6 py-2 rounded-full text-[26rpx] font-bold bouncy-btn shrink-0"
                :class="canSelectSchool ? 'border-2 border-dashed border-primary-container text-primary' : 'bg-surface-container text-outline'"
                @click="goToStep(2)">
          学校
        </button>
      </view>

      <!-- 列表区域 -->
      <scroll-view scroll-y class="h-[60vh]">
        <view class="space-y-4">
          <view v-for="item in displayList" :key="item.id"
                class="bg-white rounded-[24px] p-4 flex items-center justify-between border-2 border-dashed border-outline-variant/30 kawaii-shadow bouncy-btn"
                @click="onItemClick(item)">
            <view class="flex items-center gap-4">
              <view class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
                <text class="material-symbols-outlined text-outline">school</text>
              </view>
              <view>
                <text class="text-[32rpx] font-bold block">{{ currentStep === 2 ? item.universityName : item.name }}</text>
                <text v-if="currentStep === 2 && (selectedProvince || selectedCity)" class="text-[24rpx] text-outline">{{ selectedProvince || '' }}{{ selectedProvince && selectedCity ? ' · ' : '' }}{{ selectedCity || '' }}</text>
              </view>
            </view>
            <view v-if="isSelected(item)" class="w-6 h-6 bg-secondary-container rounded-full flex items-center justify-center">
              <text class="material-symbols-outlined text-white text-[16px]">check</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </main>

    <!-- 校区选择弹窗 -->
    <view v-if="showCampusPicker" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showCampusPicker = false">
      <view class="bg-white rounded-[32rpx] p-6 w-[80vw] max-w-[600rpx] space-y-4" @click.stop>
        <view class="text-center">
          <text class="text-[32rpx] font-bold text-on-surface">{{ pendingSchoolName }}</text>
          <text class="block text-[24rpx] text-outline mt-1">请选择校区</text>
        </view>
        <scroll-view scroll-y class="max-h-[40vh]">
          <view class="space-y-3">
            <view v-for="campus in campusList" :key="campus.id"
                  class="bg-surface-container-low rounded-[24rpx] p-4 flex items-center justify-between bouncy-btn"
                  @click="confirmCampus(campus)">
              <text class="text-[28rpx] font-bold text-on-surface">{{ campus.campusName || '主校区' }}</text>
              <text class="material-symbols-outlined text-primary">chevron_right</text>
            </view>
          </view>
        </scroll-view>
        <button class="w-full h-12 rounded-full bg-outline-variant/20 text-outline font-bold text-[28rpx] bouncy-btn mt-2" @click="showCampusPicker = false">取消</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get } from '@/utils/request.js'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight)
const searchKeyword = ref('')
const currentStep = ref(0)
const selectedProvince = ref('')
const selectedProvinceId = ref(null)
const selectedCity = ref('')
const selectedCityId = ref(null)
const selectedSchoolId = ref(null)

const provinceList = ref([])
const cityList = ref([])
const schoolList = ref([])

const showCampusPicker = ref(false)
const campusList = ref([])
const pendingSchoolName = ref('')

const canSelectSchool = computed(() => selectedProvince.value && selectedCity.value)

const uniqueSchoolList = computed(() => {
  const seen = new Set()
  return schoolList.value.filter(s => {
    if (seen.has(s.universityName)) return false
    seen.add(s.universityName)
    return true
  })
})

const filteredSchools = computed(() => {
  const base = uniqueSchoolList.value
  if (searchKeyword.value) {
    return base.filter(s => s.universityName.includes(searchKeyword.value))
  }
  return base
})

onLoad(async (options) => {
  await loadProvinces()
})

const loadProvinces = async () => {
  const res = await get('/api/v1/regions/children', { parentId: 0 })
  if (res.code === 200) provinceList.value = res.data
}

const loadCities = async (provinceId) => {
  const res = await get('/api/v1/regions/children', { parentId: provinceId })
  if (res.code === 200) cityList.value = res.data
}

const loadSchools = async (regionId, keyword = '') => {
  const params = {}
  if (regionId) params.regionId = regionId
  if (keyword) params.keyword = keyword
  const res = await get('/api/v1/universities/search', params)
  if (res.code === 200) schoolList.value = res.data
}

const selectProvince = (province) => {
  selectedProvince.value = province.name
  selectedProvinceId.value = province.id
  currentStep.value = 1
  loadCities(province.id)
}

const selectCity = (city) => {
  selectedCity.value = city.name
  selectedCityId.value = city.id
  currentStep.value = 2
  loadSchools(city.id)
}

const selectSchool = (school) => {
  selectedSchoolId.value = school.id
  uni.showModal({
    title: '确认选择',
    content: `确定选择 ${school.universityName}（${school.campusName || '主校区'}）吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.$emit('schoolSelected', { college: school.universityName, campus: school.campusName || '主校区', universityId: school.id })
        uni.navigateBack()
      }
    }
  })
}

const confirmCampus = (campus) => {
  showCampusPicker.value = false
  selectSchool(campus)
}

const displayList = computed(() => {
  if (currentStep.value === 0) return provinceList.value
  if (currentStep.value === 1) return cityList.value
  return filteredSchools.value
})

const goToStep = (step) => {
  if (step >= 1 && !selectedProvince.value) {
    uni.showToast({ title: '请先选择省份', icon: 'none' })
    return
  }
  if (step >= 2 && !selectedCity.value) {
    uni.showToast({ title: '请先选择城市', icon: 'none' })
    return
  }
  currentStep.value = step
  if (step === 0) {
    selectedCity.value = ''
    selectedCityId.value = null
    selectedSchoolId.value = null
    cityList.value = []
    schoolList.value = []
  } else if (step === 1) {
    selectedSchoolId.value = null
    schoolList.value = []
  }
}

const onItemClick = (item) => {
  if (currentStep.value === 0) {
    selectProvince(item)
  } else if (currentStep.value === 1) {
    selectCity(item)
  } else {
    const campuses = schoolList.value.filter(s => s.universityName === item.universityName)
    if (campuses.length > 1) {
      pendingSchoolName.value = item.universityName
      campusList.value = campuses
      showCampusPicker.value = true
    } else {
      selectSchool(campuses[0])
    }
  }
}

const isSelected = (item) => {
  if (currentStep.value === 0) return selectedProvince.value === item.name
  if (currentStep.value === 1) return selectedCity.value === item.name
  return selectedSchoolId.value === item.id
}

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) return
  await loadSchools(null, searchKeyword.value.trim())
  currentStep.value = 2
}

const handleBack = () => uni.navigateBack()
</script>

<style scoped>
.gradient-primary { background: linear-gradient(135deg, #FF8FA3 0%, #FFB2BD 100%); }
.bouncy-btn:active { transform: scale(0.95); transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.sticker-stroke { filter: drop-shadow(0 0 2px #fff); }
.hide-scrollbar::-webkit-scrollbar { display: none; }
</style>
