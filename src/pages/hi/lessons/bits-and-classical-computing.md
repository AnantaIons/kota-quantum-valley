---
layout: ../../../layouts/Post.astro
lang: hi
title: "Bits, logic gates और classical computing"
description: "Bit असल में क्या है, binary numbers, logic gates और universal NAND, gates से जोड़ना, information मिटाने में energy क्यों लगती है, और bits और gates को vectors और matrices की तरह कैसे लिखते हैं: qubits तक का सीधा पुल।"
date: 2026-11-04
category: lesson
lesson: 1

---

Quantum computer अलग क्या करता है, यह समझने से पहले आपको साफ़-साफ़ पता होना चाहिए कि एक साधारण कंप्यूटर क्या करता है। यह पाठ वही तस्वीर नींव से बनाता है: bit क्या है, gates bits को कैसे जोड़ते हैं, कंप्यूटर दो नंबर कैसे जोड़ता है, और फिर दो विचार जो सीधे quantum computing तक ले जाते हैं: **reversible gates**, और **bits को vectors और gates को matrices की तरह लिखना।**

पाठ के अंत तक यह वाक्य "quantum gate एक vector पर लगने वाली matrix है" पहले से समझ आने लगेगा, क्योंकि आप classical gates को ठीक यही करते देख चुके होंगे।

## Bit असल में क्या है

**Bit** information का सबसे छोटा टुकड़ा है: एक हाँ/ना सवाल का जवाब। दोनों जवाबों को हम **0** और **1** लिखते हैं।

कंप्यूटर के अंदर bit कोई काल्पनिक चीज़ नहीं है। यह हमेशा कोई भौतिक चीज़ होती है जिसकी दो साफ़ अलग हालतें हों:

| कहाँ | 0 का मतलब | 1 का मतलब |
|---|---|---|
| Processor का एक तार | कम voltage (लगभग 0 V) | ज़्यादा voltage (जैसे 0.8–1.2 V) |
| Flash memory cell (आपका फ़ोन, USB drive) | Floating gate पर charge | Charge नहीं (या उल्टा) |
| Hard disk | छोटा magnetic हिस्सा एक दिशा में | दूसरी दिशा में |
| Optical fibre | एक time slot में light pulse नहीं | Light pulse है |

इसे bit बनाता है यह कि दोनों हालतें **एक-दूसरे से दूर** हैं। 0.97 V और 1.03 V दोनों 1 पढ़े जाते हैं। छोटा noise जवाब नहीं बदलता। इसी मज़बूती की वजह से classical computers इतने भरोसेमंद हैं, और जैसा आप भाग F में देखेंगे, qubits को यह मुफ़्त में नहीं मिलती।

Classical bits की दो और ख़ूबियाँ आगे काम आएँगी:

- **Bit को बिना बदले पढ़ा जा सकता है।** तार का voltage नापने से वह पलटता नहीं।
- **Bit की जितनी चाहें copies बन सकती हैं।** Fan-out तार यही करता है।

Qubits के लिए दोनों बातें ग़लत हैं। पाठ 8 बताता है कि पढ़ने से qubit क्यों बदलता है, और पाठ 16 साबित करता है कि qubit की copy नहीं बन सकती।

## Binary numbers

एक bit से 2 चीज़ों को नाम दे सकते हैं। दो bits से 4: 00, 01, 10, 11। तीन से 8। आम तौर पर:

> **n bits में 2ⁿ अलग-अलग values हो सकती हैं, लेकिन एक समय में सिर्फ़ एक।**

"एक समय में सिर्फ़ एक" को याद रखें। Qubits के साथ सबसे बड़ा फ़र्क़ ठीक इसी बात पर है।

Binary यानी base 2 में गिनती। हर जगह की क़ीमत अपनी दाईं जगह से दोगुनी होती है:

```text
जगह की क़ीमत:   8   4   2   1
bits:           1   1   0   1
value:          8 + 4 + 0 + 1 = 13
```

तो 13 binary में **1101** है। उल्टा बदलने के लिए 2 से भाग देते रहें और शेषफल नीचे से ऊपर पढ़ें:

```text
13 ÷ 2 = 6 शेष 1
 6 ÷ 2 = 3 शेष 0
 3 ÷ 2 = 1 शेष 1
 1 ÷ 2 = 0 शेष 1     → ऊपर की ओर पढ़ें: 1101
```

आठ bits का एक **byte** होता है, जिसमें 2⁸ = 256 values (0 से 255) आती हैं। एक अंग्रेज़ी अक्षर, या pixel के एक रंग की चमक के लिए इतना काफ़ी है।

## Logic gates

**Logic gate** एक या ज़्यादा bits लेकर एक तय नियम से एक bit देता है। नियम पूरी तरह एक **truth table** से बताया जाता है: हर संभव input और उसका output।

| Gate | नियम शब्दों में | 00 | 01 | 10 | 11 |
|---|---|---|---|---|---|
| **AND** | 1 सिर्फ़ तब जब दोनों 1 हों | 0 | 0 | 0 | 1 |
| **OR** | 1 अगर कम से कम एक 1 हो | 0 | 1 | 1 | 1 |
| **XOR** | 1 अगर दोनों inputs अलग हों | 0 | 1 | 1 | 0 |
| **NAND** | AND का NOT | 1 | 1 | 1 | 0 |

और एक-input वाला gate:

| Gate | 0 | 1 |
|---|---|---|
| **NOT** | 1 | 0 |

Chip के अंदर हर gate कुछ transistors से बनता है जो voltage से चलने वाले switches की तरह काम करते हैं। आज के processor में ऐसे अरबों होते हैं।

### एक gate से सब बनाइए

एक हैरान करने वाली बात: **सिर्फ़ NAND से बाक़ी हर gate बन सकता है।** इसलिए NAND को **universal** कहते हैं।

- NOT a = a NAND a। (दोनों inputs एक ही bit a हों तो NAND, NOT a देता है।)
- a AND b = NOT (a NAND b)।
- a OR b = (NOT a) NAND (NOT b)।

इसी वजह से chip फ़ैक्ट्रियाँ एक छोटे circuit को बेहतर बनाकर उसी की copies से सब कुछ बना सकती हैं। Quantum computing में भी यही विचार है: gates का एक छोटा **universal set** जिससे कोई भी quantum operation बन सके (पाठ 17)।

### Gates से नंबर जोड़ना

कंप्यूटर जोड़ता कैसे है? दो अकेले bits जोड़कर देखें:

| a | b | a + b binary में | sum bit | carry bit |
|---|---|---|---|---|
| 0 | 0 | 00 | 0 | 0 |
| 0 | 1 | 01 | 1 | 0 |
| 1 | 0 | 01 | 1 | 0 |
| 1 | 1 | 10 | 0 | 1 |

इन columns को truth tables से मिलाइए। **Sum bit, XOR है** और **carry bit, AND है।** एक XOR और एक AND gate मिलकर **half adder** बनाते हैं। इन्हें जोड़ते जाएँ (आने वाले carry को जोड़ने के लिए थोड़ी अतिरिक्त logic के साथ) तो किसी भी लंबाई के नंबर जुड़ सकते हैं। आपके फ़ोन की हर गणना ऐसी ही तरकीबों से बनी है।

## कोड: हर gate NAND से बनाइए

```python
def NAND(a, b): return 1 - (a & b)
def NOT(a):     return NAND(a, a)
def AND(a, b):  return NOT(NAND(a, b))
def OR(a, b):   return NAND(NOT(a), NOT(b))
def XOR(a, b):  return AND(OR(a, b), NAND(a, b))

print("a b | AND OR XOR NAND")
for a in (0, 1):
    for b in (0, 1):
        print(a, b, "|", AND(a, b), "  ", OR(a, b), " ", XOR(a, b), "  ", NAND(a, b))

def half_adder(a, b): return XOR(a, b), AND(a, b)   # (sum, carry)
print(half_adder(1, 1))
```

```text
a b | AND OR XOR NAND
0 0 | 0    0   0    1
0 1 | 0    1   1    1
1 0 | 0    1   1    1
1 1 | 1    1   0    0
(0, 1)
```

आख़िरी लाइन कहती है कि 1 + 1 से sum 0 और carry 1 मिलता है: binary में 10, यानी 2। ध्यान दें कि XOR को "OR और NAND" से बनाया: 1 तब जब कम से कम एक input 1 हो **और** दोनों न हों।

## Reversible gates: quantum की ओर पहला क़दम

AND की truth table फिर देखिए। अगर AND का output 0 है, तो inputs क्या थे? 00, 01 या 10 कुछ भी हो सकता है। **पता नहीं चल सकता।** AND information नष्ट करता है: तीन अलग inputs एक ही output देते हैं, तो input वापस नहीं मिल सकता।

जिस gate के output से input हमेशा वापस मिल सके, उसे **reversible** कहते हैं। NOT reversible है: output 1 है तो input 0 था। AND, OR, XOR और NAND (एक output के साथ) reversible नहीं हैं।

इसकी परवाह क्यों करें? दो कारण।

**1. Information मिटाने में energy लगती है।** 1961 में Rolf Landauer ने दिखाया कि एक bit मिटाने पर कम से कम kT·ln 2 गर्मी निकलनी ही चाहिए (k Boltzmann constant है, T तापमान)। कमरे के तापमान पर यह लगभग 3 × 10⁻²¹ joule है: बहुत छोटा, और आज के chips दूसरे कारणों से इससे कहीं ज़्यादा energy बर्बाद करते हैं। लेकिन यह information और energy को जोड़ने वाला एक असली भौतिक नियम है।

**2. Quantum gates का reversible होना ज़रूरी है।** पाठ 4 में आप देखेंगे कि quantum computer ऐसे operations से चलता है जिन्हें हमेशा उलटा किया जा सके। तो कोई भी classical गणना जो हम quantum computer पर चलाना चाहें, पहले reversible gates में दोबारा लिखनी पड़ती है।

### Gates को reversible कैसे बनाएँ

तरकीब है **inputs को रखे रहना** और जवाब एक अतिरिक्त bit में लिखना।

**CNOT (controlled-NOT):** दो bits अंदर, दो बाहर। पहला bit (*control*) बिना बदले निकल जाता है। दूसरा bit (*target*) तब पलटता है जब control 1 हो।

| अंदर (control, target) | बाहर |
|---|---|
| 00 | 00 |
| 01 | 01 |
| 10 | 11 |
| 11 | 10 |

Target बन जाता है control XOR target। हर output ठीक एक बार आता है, इसलिए यह reversible है। असल में CNOT दो बार लगाने से आप वहीं लौट आते हैं जहाँ से शुरू किया था।

**Toffoli (controlled-controlled-NOT):** तीन bits अंदर, तीन बाहर। तीसरा bit तभी पलटता है जब पहले दोनों 1 हों। अगर शुरू में तीसरा bit 0 रखें, तो अंत में उसमें **a AND b** होता है, और a, b बचे रहते हैं:

| a | b | c (शुरू) | c (अंत) |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 0 |
| 1 | 0 | 0 | 0 |
| 1 | 1 | 0 | **1** |

Reversible classical computing के लिए Toffoli universal है: इससे (और 0 या 1 पर रखे कुछ अतिरिक्त bits से) कोई भी गणना हो सकती है जो साधारण कंप्यूटर करता है। CNOT और Toffoli दोनों पाठ 13 में quantum gates बनकर लौटते हैं, ठीक इन्हीं truth tables के साथ।

## Bits vectors की तरह, gates matrices की तरह

अब इस पाठ का सबसे ज़रूरी विचार। आसान चीज़ों को लिखने का यह अजीब तरीका लगता है, लेकिन यही quantum computing की भाषा है।

Bit 0 को column vector **[1, 0]** लिखें और bit 1 को **[0, 1]**। हर vector में उस जगह 1 है जिस value का वह प्रतिनिधि है। (इसे *one-hot* encoding कहते हैं।)

तब NOT यह matrix है:

```text
NOT = [ 0  1 ]
      [ 1  0 ]
```

और gate लगाना यानी matrix को vector से गुणा करना। हर output entry, matrix की एक row गुणा input vector है:

```text
NOT × [1, 0] = [0×1 + 1×0,  1×1 + 0×0] = [0, 1]     (0 बना 1)
NOT × [0, 1] = [0×0 + 1×1,  1×0 + 0×1] = [1, 0]     (1 बना 0)
```

दो bits भी ऐसे ही चलते हैं, बस **4 entries वाले vectors** के साथ, 00, 01, 10, 11 हर एक के लिए एक जगह। जैसे 10 है [0, 0, 1, 0]। हर reversible दो-bit gate एक **4×4 matrix** बन जाता है जिसकी हर row और column में ठीक एक 1 है (*permutation matrix*)। CNOT:

```text
         00 01 10 11   ← input
CNOT = [ 1  0  0  0 ]  → 00
       [ 0  1  0  0 ]  → 01
       [ 0  0  0  1 ]  → 10
       [ 0  0  1  0 ]  → 11
```

हर column को ऐसे पढ़ें: "यह input कहाँ जाता है?" Column 10 का 1, row 11 में है, तो 10 → 11।

एक बात पर ध्यान दें: n bits के लिए **2ⁿ** लंबाई का vector चाहिए। Classical bits के लिए यह फ़िज़ूल है, क्योंकि हमेशा सिर्फ़ एक entry 1 होती है। Quantum computing वह है जो आपको तब मिलता है जब **सभी 2ⁿ entries एक साथ non-zero हो सकें।**

### कोड: gates matrices की तरह

```python
import numpy as np
zero, one = np.array([1, 0]), np.array([0, 1])
NOTm = np.array([[0, 1],
                 [1, 0]])
print(NOTm @ zero, NOTm @ one)

# Two bits: 00, 01, 10, 11 become 4 one-hot vectors.
CNOT = np.array([[1, 0, 0, 0],
                 [0, 1, 0, 0],
                 [0, 0, 0, 1],
                 [0, 0, 1, 0]])
for i, label in enumerate(["00", "01", "10", "11"]):
    v = np.zeros(4, dtype=int); v[i] = 1
    out = CNOT @ v
    print(label, "->", ["00", "01", "10", "11"][int(np.argmax(out))])
```

```text
[0 1] [1 0]
00 -> 00
01 -> 01
10 -> 11
11 -> 10
```

Python में `@` का मतलब matrix गुणा है। आपने अभी एक classical कंप्यूटर को linear algebra की तरह चलाया।

## पक्के bits से random bits तक

अगर bit की value पता न हो, सिर्फ़ संभावनाएँ पता हों तो? देखने से पहले एक ठीक सिक्का ½ probability से 0 और ½ से 1 है। इसे vector **[0.5, 0.5]** लिखें: entries probabilities हैं, और उनका जोड़ 1 है।

सिक्के पर NOT लगाएँ: NOT × [0.5, 0.5] = [0.5, 0.5]। अब भी ठीक सिक्का, जो समझ में आता है। झुका हुआ सिक्का [0.9, 0.1] बन जाता है [0.1, 0.9]।

इसे **probabilistic bit** कहते हैं, और यह काफ़ी हद तक qubit जैसा दिखता है: एक vector जिसकी entries 0 और 1 की संभावना बताती हैं। लेकिन एक फ़र्क़ सब कुछ बदल देता है:

| | Probabilistic bit | Qubit |
|---|---|---|
| Entries हैं | Probabilities | **Amplitudes** |
| Entries हो सकती हैं | सिर्फ़ 0 से 1 | **Negative, या complex** |
| Probabilities आती हैं | सीधे entries से | Entries के **वर्ग** से |
| एक ही नतीजे तक दो रास्ते | हमेशा जुड़ते हैं | **एक-दूसरे को काट सकते हैं** |

वह आख़िरी row, कटना, **interference** कहलाता है, और यही कारण है कि quantum computers वह कर सकते हैं जो probabilistic computers नहीं कर सकते। पाठ 2 इसके लिए ज़रूरी complex numbers देता है, और पाठ 5 वह प्रयोग दिखाता है जिसने इसे उजागर किया।

## Classical computers को quantum computers simulate करने में मुश्किल क्यों

सिद्धांत में classical कंप्यूटर किसी भी quantum computer को simulate कर सकता है: vector की सभी 2ⁿ entries रखिए और matrices से गुणा कीजिए। समस्या आकार है। हर entry एक complex number है, आमतौर पर 16 bytes:

| Qubits | Entries (2ⁿ) | Memory |
|---|---|---|
| 10 | 1,024 | 16 kilobytes |
| 30 | लगभग 1 अरब | 17 gigabytes |
| 50 | लगभग 10¹⁵ | 18 petabytes (1.8 करोड़ gigabytes) |
| 300 | लगभग 10⁹⁰ | पूरे दृश्य ब्रह्मांड के atoms की संख्या से ज़्यादा |

हर अतिरिक्त qubit memory **दोगुनी** कर देता है। लगभग 50 qubits पर सबसे बड़े supercomputers के पास सीधे simulation की जगह नहीं बचती। यही दोगुना होना quantum computers की संभावित ताक़त की गहरी वजह है, हालाँकि जैसा पाठ 31 ध्यान से बताता है, बड़ी state का मतलब अपने-आप बड़ा speed-up नहीं होता।

## ख़ुद करके देखें

1. 45 को binary में, और 10110 को decimal में बदलें।
2. 16 bits में कितनी अलग values आ सकती हैं?
3. काग़ज़ पर सिर्फ़ NAND gates से OR बनाइए, और चारों inputs जाँचिए।
4. XOR (एक output) reversible है? और दो-output वाला gate (a, b) → (a, a XOR b)?
5. SWAP gate की 4×4 matrix लिखिए, जो दो bits की जगह बदलता है: 01 → 10, 10 → 01, और 00, 11 वैसे ही।
6. झुके सिक्के [0.7, 0.3] पर NOT लगाइए। नतीजे का मतलब क्या है?

**जवाब:**

1. 45 = 32 + 8 + 4 + 1 = **101101**। 10110 = 16 + 4 + 2 = **22**।
2. 2¹⁶ = **65,536**।
3. (a NAND a) NAND (b NAND b)। Inputs 00 → (1) NAND (1) = 0; 01 → 1 NAND 0 = 1; 10 → 0 NAND 1 = 1; 11 → 0 NAND 0 = 1। यही OR है।
4. एक output वाला XOR reversible **नहीं** है (output 0, 00 और 11 दोनों से आता है)। दो-output वाला **है**: यह CNOT ही है।
5. Rows और columns 00, 01, 10, 11 क्रम में: [[1,0,0,0], [0,0,1,0], [0,1,0,0], [0,0,0,1]]।
6. [0.3, 0.7]: अब सिक्का 0.7 probability से 1 है। NOT ने संभावनाएँ आपस में बदल दीं।

## सार

| विचार | मुख्य बात |
|---|---|
| Bit | दो साफ़ अलग हालतों वाला भौतिक system, 0 और 1 |
| n bits | 2ⁿ संभव values, एक समय में एक |
| Binary | जगहों की क़ीमत 1, 2, 4, 8, …; 13 = 1101 |
| Universal gate | NAND से NOT, AND, OR और बाक़ी सब बनता है |
| Half adder | sum = XOR, carry = AND |
| Reversible gate | Output से input हमेशा वापस मिल सके |
| Landauer | एक bit मिटाने पर कम से कम kT·ln 2 गर्मी |
| CNOT | Control 1 हो तो target पलटे; reversible |
| Toffoli | पहले दोनों 1 हों तो तीसरा पलटे; AND को reversibly निकालता है |
| Bits vectors की तरह | 0 = [1, 0], 1 = [0, 1]; n bits के लिए लंबाई 2ⁿ |
| Gates matrices की तरह | Gate लगाना = matrix × vector |
| Probabilistic bit | Entries probabilities हैं; कट नहीं सकतीं |
| Qubit (झलक) | Entries amplitudes हैं; negative या complex हो सकती हैं; कट सकती हैं |
| Simulation की लागत | हर qubit पर memory दोगुनी; ~50 qubits पर supercomputers भी हार जाते हैं |
