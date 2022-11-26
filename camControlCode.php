<?php
$out1 = 2;
$out2 = 0;
$out3 = 3;
$out4 = 1;
$i = 0;
$positive = 0;
$negative = 0;
$y = 0;
$x = $_GET["angle"];
//system("gpio mode $pin out");
system("gpio mode $out1 out");
system("gpio mode $out2 out");
system("gpio mode $out3 out");
system("gpio mode $out4 out");
//system("gpio write $pin 1");
system("gpio write $out1 0");
system("gpio write $out2 0");
system("gpio write $out3 0");
system("gpio write $out4 0");
if ($x > 0 && $x <= 400) {
    $positive = 1;
    for ($y = $x;$y >= 0;$y--) {
        if ($negative == 1) {
            if ($i == 7) {
                $i = 0;
            } else {
                $i+= 1;
            }
            $y+= 2;
            $negative = 0;
        }
        if ($i == 0) {
            system("gpio write $out1 1");
            system("gpio write $out2 0");
            system("gpio write $out3 0");
            system("gpio write $out4 0");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 1) {
            system("gpio write $out1 1");
            system("gpio write $out2 1");
            system("gpio write $out3 0");
            system("gpio write $out4 0");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 2) {
            system("gpio write $out1 0");
            system("gpio write $out2 1");
            system("gpio write $out3 0");
            system("gpio write $out4 0");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 3) {
            system("gpio write $out1 0");
            system("gpio write $out2 1");
            system("gpio write $out3 1");
            system("gpio write $out4 0");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 4) {
            system("gpio write $out1 0");
            system("gpio write $out2 0");
            system("gpio write $out3 1");
            system("gpio write $out4 0");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 5) {
            system("gpio write $out1 0");
            system("gpio write $out2 0");
            system("gpio write $out3 1");
            system("gpio write $out4 1");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 6) {
            system("gpio write $out1 0");
            system("gpio write $out2 0");
            system("gpio write $out3 0");
            system("gpio write $out4 1");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 7) {
            system("gpio write $out1 1");
            system("gpio write $out2 0");
            system("gpio write $out3 0");
            system("gpio write $out4 1");
            sleep(0.03);
            #time.sleep(1)
            
        }
        if ($i == 7) {
            $i = 0;
            continue;
        }
        $i+= 1;
    }
} else if ($x < 0 && $x >= - 400) {
    $x = $x * -1;
    $negative = 1;
    for ($y = $x;$y >= 0;$y--) {
        if ($positive == 1) {
            if ($i == 0) {
                $i = 7;
            } else {
                $i-= 1;
                $y+= 3;
            }
            $positive = 0;
        }
        if ($i == 0) {
            system("gpio write $out1 1");
            system("gpio write $out2 0");
            system("gpio write $out3 0");
            system("gpio write $out4 0");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 1) {
            system("gpio write $out1 1");
            system("gpio write $out2 1");
            system("gpio write $out3 0");
            system("gpio write $out4 0");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 2) {
            system("gpio write $out1 0");
            system("gpio write $out2 1");
            system("gpio write $out3 0");
            system("gpio write $out4 0");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 3) {
            system("gpio write $out1 0");
            system("gpio write $out2 1");
            system("gpio write $out3 1");
            system("gpio write $out4 0");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 4) {
            system("gpio write $out1 0");
            system("gpio write $out2 0");
            system("gpio write $out3 1");
            system("gpio write $out4 0");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 5) {
            system("gpio write $out1 0");
            system("gpio write $out2 0");
            system("gpio write $out3 1");
            system("gpio write $out4 1");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 6) {
            system("gpio write $out1 0");
            system("gpio write $out2 0");
            system("gpio write $out3 0");
            system("gpio write $out4 1");
            sleep(0.03);
            #time.sleep(1)
            
        } else if ($i == 7) {
            system("gpio write $out1 1");
            system("gpio write $out2 0");
            system("gpio write $out3 0");
            system("gpio write $out4 1");
            sleep(0.03);
            #time.sleep(1)
            
        }
        if ($i == 0) {
            $i = 7;
            continue;
        }
        $i-= 1;
    }
}
?>