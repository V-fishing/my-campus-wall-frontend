#!/usr/bin/perl
use strict;
use warnings;
use File::Find;

my $src_dir = 'src';

find(sub {
    return unless -f $_ && /\.(vue|scss|css)$/;
    my $file = $File::Find::name;
    open my $fh, '<:encoding(UTF-8)', $file or die "Cannot read $file: $!";
    local $/;
    my $content = <$fh>;
    close $fh;
    my $original = $content;

    # Neutralize shadow class definitions
    $content =~ s/\.kawaii-shadow\s*\{[^}]*box-shadow:[^}]*\}/.kawaii-shadow { box-shadow: none; }/g;
    $content =~ s/\.bouncy-shadow\s*\{[^}]*box-shadow:[^}]*\}/.bouncy-shadow { box-shadow: none; }/g;
    $content =~ s/\.sticker-shadow\s*\{[^}]*box-shadow:[^}]*\}/.sticker-shadow { box-shadow: none; }/g;

    # Neutralize sticker-border (usually combines white border + shadow)
    $content =~ s/\.sticker-border\s*\{[^}]*\}/.sticker-border { border: none; }/g;

    # Neutralize sticker-stroke (drop-shadow filter)
    $content =~ s/\.sticker-stroke\s*\{[^}]*\}/.sticker-stroke { }/g;

    # Neutralize dashed decorative borders
    $content =~ s/\.dashed-border-card\s*\{[^}]*\}/.dashed-border-card { border: none; }/g;
    $content =~ s/\.dashed-doodle\s*\{[^}]*\}/.dashed-doodle { border: none; }/g;
    $content =~ s/\.doodle-border\s*\{[^}]*\}/.doodle-border { border: none; }/g;

    # Remove inline Tailwind shadow classes with pink tint
    $content =~ s/\s*shadow-\[0_\d+rpx_\d+rpx_rgba\(255,\s*143,\s*163,\s*[\d.]+\)\]//g;
    $content =~ s/\s*shadow-\[0_\d+px_\d+px_rgba\(255,\s*143,\s*163,\s*[\d.]+\)\]//g;
    $content =~ s/\s*shadow-\[0_-?\d+rpx_\d+rpx_rgba\(255,\s*143,\s*163,\s*[\d.]+\)\]//g;
    $content =~ s/\s*shadow-\[0_\d+px_\d+px_rgba\(155,\s*64,\s*83,\s*[\d.]+\)\]//g;

    # Remove inline box-shadow declarations with pink tint
    $content =~ s/\s*box-shadow:\s*0\s+\d+rpx\s+\d+rpx\s+rgba\(255,\s*143,\s*163,\s*[\d.]+\);?//g;
    $content =~ s/\s*box-shadow:\s*0\s+\d+px\s+\d+px\s+rgba\(255,\s*143,\s*163,\s*[\d.]+\);?//g;
    $content =~ s/\s*box-shadow:\s*0\s+0\s+0\s+\d+rpx\s+#ffffff,\s*0\s+\d+rpx\s+\d+rpx\s+rgba\(255,\s*143,\s*163,\s*[\d.]+\);?//g;
    $content =~ s/\s*box-shadow:\s*0\s+\d+rpx\s+\d+rpx\s+rgba\(0,\s*0,\s*0,\s*[\d.]+\),\s*0\s+0\s+0\s+\d+rpx\s+#ffffff;?//g;
    $content =~ s/\s*box-shadow:\s*0\s+\d+rpx\s+\d+rpx\s+rgba\(134,\s*182,\s*219,\s*[\d.]+\);?//g;

    # Remove drop-shadow filters with pink tint
    $content =~ s/\s*filter:\s*drop-shadow\(0\s+0\s+\d+rpx\s+#ffffff\)\s+drop-shadow\(0\s+\d+rpx\s+\d+rpx\s+rgba\(255,\s*143,\s*163,\s*[\d.]+\)\);?//g;

    # Remove border-dashed with pink colors
    $content =~ s/\s*border-dashed\s+border-\[#FF8FA3\]\/[\d]+//g;
    $content =~ s/\s*border-\[#FF8FA3\]\/[\d]+\s+border-dashed//g;
    $content =~ s/\s*border-dashed\s+border-primary-fixed-dim//g;
    $content =~ s/\s*border-dashed\s+border-primary\/\d+//g;

    # Replace background gradient fades with solid page background
    $content =~ s/bg-gradient-to-t\s+from-\[#fef8f8\]\s+via-\[#fef8f8\]\s+to-transparent/bg-[#F4F5F7]/g;
    $content =~ s/bg-gradient-to-t\s+from-background\s+via-background\s+to-transparent/bg-[#F4F5F7]/g;

    if ($content ne $original) {
        open my $out, '>:encoding(UTF-8)', $file or die "Cannot write $file: $!";
        print $out $content;
        close $out;
        print "Updated $file\n";
    }
}, $src_dir);
