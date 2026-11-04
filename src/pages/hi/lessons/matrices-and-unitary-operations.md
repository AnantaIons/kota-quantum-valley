---
layout: ../../../layouts/Post.astro
lang: hi
title: "Matrices और unitary operations"
description: "Matrix किसी vector पर कैसे लगती है, gates का क्रम क्यों मायने रखता है, conjugate transpose, matrix unitary कब होती है और हर quantum gate का unitary होना क्यों ज़रूरी है, Hermitian matrices, और eigenvalues व eigenvectors हाथ से और कोड में।"
date: 2026-11-04
category: lesson
lesson: 4

---

अगर qubit की state एक vector है (पाठ 3), तो qubit के साथ आप जो कुछ भी **करते** हैं, वह एक **matrix** है: एक नियम जो पुराना vector लेकर नया बनाता है। Quantum gates, पूरे circuits, यहाँ तक कि भौतिक qubit में समय का बीतना भी: सब matrices हैं।

लेकिन हर matrix की इजाज़त नहीं है। Quantum mechanics सिर्फ़ एक ख़ास तरह की matrix मानती है, जिसे **unitary** कहते हैं। यह पाठ सिखाता है कि matrices कैसे लगती हैं, उन्हें कैसे जोड़ें, कैसे जाँचें कि कोई unitary है या नहीं, और eigenvalues क्या हैं और लगभग हर एडवांस्ड algorithm में क्यों आते हैं।

## Matrix गुणा vector

2×2 matrix, 2 entries वाले vector पर लगकर नया 2-entry vector देती है। नतीजे की हर entry **matrix की एक row, vector से entry-दर-entry गुणा करके जोड़ी हुई** है:

```text
[ a  b ] [ x ]   [ a·x + b·y ]
[ c  d ] [ y ] = [ c·x + d·y ]
```

**हल किया उदाहरण: Hadamard gate।** H = (1/√2)·[[1, 1], [1, −1]]। इसे |0⟩ = [1, 0] पर लगाएँ:

```text
H|0⟩ = (1/√2) [ 1·1 + 1·0  ]  = (1/√2) [ 1 ]  = (|0⟩ + |1⟩)/√2 = |+⟩
              [ 1·1 + (−1)·0 ]         [ 1 ]
```

और |1⟩ = [0, 1] पर:

```text
H|1⟩ = (1/√2) [ 1·0 + 1·1  ]  = (1/√2) [  1 ]  = (|0⟩ − |1⟩)/√2 = |−⟩
              [ 1·0 + (−1)·1 ]         [ −1 ]
```

एक काम का shortcut: **matrix के columns वही हैं जो वह basis states के साथ करती है।** H का पहला column [1, 1]/√2, H|0⟩ है, और दूसरा column [1, −1]/√2, H|1⟩ है। तो अगर कोई बताए कि gate |0⟩ और |1⟩ के साथ क्या करता है, आप तुरंत उसकी matrix लिख सकते हैं।

Dirac notation में यही विचार: gate को outer products (पाठ 3) के जोड़ की तरह लिखा जा सकता है, "यह input उस output में भेजो"। X (NOT) gate के लिए:

> X = |1⟩⟨0| + |0⟩⟨1|

इसे |0⟩ पर लगाएँ: |1⟩⟨0|0⟩ + |0⟩⟨1|0⟩ = |1⟩·1 + |0⟩·0 = |1⟩। यह एक वाक्य की तरह पढ़ा जाता है: "जो |0⟩ था वह |1⟩ बनता है, और जो |1⟩ था वह |0⟩"।

## Matrix गुणा matrix: एक gate के बाद दूसरा

State |ψ⟩ पर पहले gate A और फिर gate B लगाने से B(A|ψ⟩) मिलता है। Matrix गुणा से इन्हें पहले एक matrix में जोड़ा जा सकता है:

> B(A|ψ⟩) = (BA)|ψ⟩

दो matrices गुणा करने के लिए, नतीजे की हर entry **बाईं matrix की एक row गुणा दाईं matrix का एक column** है:

```text
[ a  b ] [ e  f ]   [ ae+bg  af+bh ]
[ c  d ] [ g  h ] = [ ce+dg  cf+dh ]
```

### क्रम पर ध्यान दें

एक बात जो शुरू में सबको उलझाती है: **पहले लगने वाला gate दाईं तरफ़ लिखा जाता है।** Circuit diagram बाएँ से दाएँ पढ़ा जाता है (A, फिर B), लेकिन matrix गुणनफल दाएँ से बाएँ (BA)। इसे functions की तरह सोचें: f(g(x)) में g पहले होता है।

और साधारण नंबरों के उलट, **matrices के लिए क्रम मायने रखता है:** AB आमतौर पर BA के बराबर नहीं होता। X = [[0, 1], [1, 0]] और Z = [[1, 0], [0, −1]] लें:

```text
XZ = [ 0·1+1·0   0·0+1·(−1) ]  = [ 0  −1 ]
     [ 1·1+0·0   1·0+0·(−1) ]    [ 1   0 ]

ZX = [ 1·0+0·1   1·1+0·0 ]     = [  0  1 ]
     [ 0·0+(−1)·1  0·1+(−1)·0 ]  [ −1  0 ]
```

दोनों में चिह्न का फ़र्क़ है: XZ = −ZX। भौतिक रूप से, "पहले पलटो फिर phase दो" और "पहले phase दो फिर पलटो" एक नहीं हैं। यह non-commutativity quantum mechanics की सबसे गहरी ख़ूबियों में से है; uncertainty principle के पीछे यही है।

### एक हैरान करने वाली identity

H·Z·H गुणा करके देखें (यानी पहले H, फिर Z, फिर H):

> HZH = X

Z को दो Hadamards के बीच रखने से वह X बन जाता है। शब्दों में: **H, 0/1 basis और +/− basis की भूमिकाएँ बदल देता है**, तो एक basis का phase flip दूसरे में bit flip बन जाता है। यह तरकीब आप CZ से CNOT जैसे gates बनाने (पाठ 13) और error correction समझने (भाग F) में इस्तेमाल करेंगे।

## Conjugate transpose (dagger)

पाठ 3 में ket को लिटाकर और conjugate करके bra बनाया था। यही पूरी matrix के साथ हो सकता है: **rows और columns की अदला-बदली करें, और हर entry का conjugate लें।** यह **conjugate transpose** है, जिसे A† ("A dagger") लिखते हैं।

```text
A = [ 1   2i ]          A† = [  1    3  ]
    [ 3   4  ]               [ −2i   4  ]
```

2i ऊपर-दाएँ से नीचे-बाएँ गया और −2i बन गया। दो नियम जानने लायक: (A†)† = A, और **(AB)† = B†A†**, क्रम उलटकर (जैसे मोज़े फिर जूते पहनना, और उतारते समय उल्टा)।

## Unitary matrices: प्रकृति जिन gates की इजाज़त देती है

Matrix U **unitary** है अगर

> **U†U = I**

जहाँ I identity matrix [[1, 0], [0, 1]] है (वह matrix जो कुछ नहीं करती)। शब्दों में: **U†, U को उलट देता है।** Unitary का inverse बस उसका dagger है, जो निकालना आसान है।

### हर quantum gate का unitary होना क्यों ज़रूरी है

तीन बराबर कारण हैं, और हर एक कुछ असली कहता है।

**1. Probabilities का जोड़ 1 रहना चाहिए।** State की लंबाई 1 है। Gate के बाद भी लंबाई 1 रहनी चाहिए, वरना probabilities का जोड़ 1 नहीं रहेगा। Unitary matrices ठीक वही हैं जो किसी vector की लंबाई कभी नहीं बदलतीं:

> ⟨Uψ|Uψ⟩ = ⟨ψ|U†U|ψ⟩ = ⟨ψ|I|ψ⟩ = ⟨ψ|ψ⟩ = 1

**2. अलग पहचानी जा सकने वाली states वैसी ही रहती हैं।** दो अलग states के साथ यही गणना दिखाती है कि ⟨Uφ|Uψ⟩ = ⟨φ|ψ⟩। अगर gate से पहले दो states orthogonal (पूरी तरह पहचानी जा सकने वाली) थीं, तो बाद में भी रहेंगी। Gate पूरे space को घुमा सकता है, पिचका नहीं सकता।

**3. Quantum evolution reversible है।** क्योंकि U†U = I, हर gate को उलटा किया जा सकता है। इसीलिए पाठ 1 का irreversible AND gate अपने रूप में quantum gate नहीं हो सकता।

### एक जल्दी वाला test: orthonormal columns

Unitarity को नज़र से जाँचने का तेज़ तरीका है। **Matrix तभी unitary है जब उसके columns orthonormal vectors हों:** हर column की लंबाई 1, और हर दो अलग columns का inner product 0। (U†U = I यही entry-दर-entry कहता है।)

H जाँचें: columns [1, 1]/√2 और [1, −1]/√2 दोनों की लंबाई 1, और inner product (1 − 1)/2 = 0। ✓ Unitary।

अब matrix B = [[1, 1], [0, 0]] लें। इसके columns [1, 0] और [1, 0] हैं: एक ही vector दो बार, तो orthogonal नहीं। ✗ Unitary नहीं। देखें यह क्या करती है: B|0⟩ = [1, 0] और B|1⟩ = [1, 0]। **दो अलग inputs एक ही output देते हैं**, तो information नष्ट होती है, ठीक पाठ 1 के AND gate की तरह।

### कोड: unitarity जाँचना

```python
import numpy as np
X = np.array([[0, 1], [1, 0]])
Z = np.array([[1, 0], [0, -1]])
H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)

print(X @ Z)
print(Z @ X)
print(np.allclose(X @ Z, -(Z @ X)))

def is_unitary(U):
    return np.allclose(U.conj().T @ U, np.eye(len(U)))
B = np.array([[1, 1], [0, 0]])                # a "gate" that merges two states
print(is_unitary(X), is_unitary(H), is_unitary(B))
print(B @ [1, 0], B @ [0, 1])
```

```text
[[ 0 -1]
 [ 1  0]]
[[ 0  1]
 [-1  0]]
True
True True False
[1 0] [1 0]
```

`U.conj().T` dagger है: conjugate, फिर transpose। `np.allclose` rounding ग़लतियों के लिए थोड़ी छूट के साथ तुलना करता है।

## Hermitian matrices: वे सवाल जो आप पूछ सकते हैं

Matrix **Hermitian** है अगर वह अपने dagger के बराबर हो: **A† = A**। (उसकी diagonal entries real होनी चाहिए, और diagonal के पार हर entry उसका conjugate।)

X और Z दोनों Hermitian *और* unitary हैं। Hermitian matrices की भूमिका unitary से अलग है:

| तरह | नियम | Quantum computing में भूमिका |
|---|---|---|
| Unitary | U†U = I | **काम**: gates, state के साथ जो आप करते हैं |
| Hermitian | A† = A | **Observables**: जो मात्राएँ आप नापते हैं, जैसे energy या "0 या 1" |

Hermitian matrices measurements क्यों बताती हैं, यह अगला विषय है: उनके eigenvalues हमेशा **real numbers** होते हैं, और measurement का नतीजा real number ही होना चाहिए।

## Eigenvalues और eigenvectors

ज़्यादातर vectors पर matrix लगने से उनकी दिशा बदल जाती है। लेकिन कुछ ख़ास vectors बस **एक नंबर से गुणा** हो जाते हैं:

> A|v⟩ = λ|v⟩

ऐसा |v⟩, A का **eigenvector** है, और नंबर λ (lambda) उसका **eigenvalue**। ("Eigen" जर्मन में "अपना" है: matrix की अपनी दिशाएँ।)

**Z के eigenvectors** आसानी से दिखते हैं:

```text
Z|0⟩ = [ 1  0 ][1] = [1] = +1·|0⟩     eigenvalue +1
       [ 0 −1 ][0]   [0]
Z|1⟩ = [ 1  0 ][0] = [ 0] = −1·|1⟩    eigenvalue −1
       [ 0 −1 ][1]   [−1]
```

**X के eigenvectors** |+⟩ और |−⟩ हैं:

```text
X|+⟩ = (1/√2)[0·1+1·1, 1·1+0·1] = (1/√2)[1, 1] = +1·|+⟩
X|−⟩ = (1/√2)[0·1+1·(−1), 1·1+0·(−1)] = (1/√2)[−1, 1] = −1·|−⟩
```

भौतिक मतलब यह है। जब आप किसी **observable** (Hermitian matrix) को **measure** करते हैं, तो संभव नतीजे उसके **eigenvalues** होते हैं, और measurement के ठीक बाद qubit मेल खाते **eigenvector** में होता है। Z measure करने पर +1 मिलता है (और |0⟩ बचता है) या −1 (और |1⟩ बचता है)। यह बस साधारण "0 या 1" measurement है, नतीजों पर 0, 1 की जगह +1, −1 का label। X measure करना "+ या −" वाला measurement है।

### Eigenvalues हाथ से निकालना

2×2 matrix के लिए eigenvalues इसके हल हैं:

> det(A − λI) = 0

जहाँ det[[a, b], [c, d]] = ad − bc। X के लिए:

```text
det [ −λ   1 ]  = (−λ)(−λ) − 1·1 = λ² − 1 = 0   →   λ = +1 या −1
    [  1  −λ ]
```

फिर हर λ के लिए (A − λI)|v⟩ = 0 हल करके eigenvector निकालें। λ = +1 के लिए v₁ = v₂ मिलता है, तो |v⟩ ∝ [1, 1], जो normalise होकर |+⟩ बनता है।

### Unitaries के eigenvalues phases होते हैं

क्योंकि unitary कभी लंबाई नहीं बदलता, अगर U|v⟩ = λ|v⟩ तो |λ| = 1 होना चाहिए। तो **unitary का हर eigenvalue एक phase e^(iθ) है** (पाठ 2)। जैसे S gate = [[1, 0], [0, i]] के eigenvalues 1 और i हैं, यानी e^(i·0) और e^(iπ/2)।

यही तथ्य सबसे ज़रूरी algorithms में से एक को चलाता है: **quantum phase estimation** (पाठ 27) unitary के eigenvalue e^(iθ) में छिपा कोण θ ढूँढता है। Shor का factoring algorithm और quantum chemistry, दोनों phase estimation के ही रूप हैं।

### कोड: eigenvalues

```python
import numpy as np
X = np.array([[0, 1], [1, 0]])
vals, vecs = np.linalg.eig(X)
print(np.round(vals, 4))
print(np.round(vecs, 4))
S = np.array([[1, 0], [0, 1j]])
print(np.round(np.linalg.eigvals(S), 4))
```

```text
[ 1.+0.j -1.+0.j]
[[ 0.7071+0.j -0.7071+0.j]
 [ 0.7071+0.j  0.7071+0.j]]
[1.+0.j 0.+1.j]
```

Eigenvectors, `vecs` के **columns** हैं। पहला [0.7071, 0.7071] = |+⟩ है, जैसी उम्मीद थी। दूसरा [−0.7071, 0.7071] है, यानी −|−⟩। यह |−⟩ को −1 से गुणा किया हुआ है, एक global phase (पाठ 2): eigenvector का कोई भी गुणज भी eigenvector है, और वही भौतिक state है।

## Circuits matrices हैं: Qiskit में HZH = X साबित करना

Qiskit किसी भी circuit को `Operator` से उसकी matrix में बदल सकता है। ऊपर वाली identity, जाँची हुई:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator
qc = QuantumCircuit(1)
qc.h(0)
qc.z(0)
qc.h(0)
U = Operator(qc)
print(np.round(U.data.real, 4))
print(U.equiv(Operator.from_label('X')))
print(U.is_unitary())
```

```text
[[0. 1.]
 [1. 0.]]
True
True
```

Circuit की matrix ठीक X है। `equiv` global phase छोड़कर बराबरी जाँचता है, जो "एक ही भौतिक gate" के लिए सही test है।

## आगे की झलक: बड़ी matrices

यहाँ का सब किसी भी आकार के लिए चलता है। दो qubits के लिए 4×4 matrices, n qubits के लिए 2ⁿ × 2ⁿ। छोटी matrices से बड़ी बनाने का नियम, जैसे "पहले qubit पर X और दूसरे पर कुछ नहीं", **tensor product** X ⊗ I है, जिसे पाठ 12 सिखाता है। और किसी भी कोण से घुमाव, जैसे "x-अक्ष के चारों ओर θ घुमाओ", cos(θ/2)·I − i·sin(θ/2)·X जैसी matrices हैं, जिन्हें पाठ 11 बनाता है।

## ख़ुद करके देखें

1. H|+⟩ और H|−⟩ निकालें। H दो बार लगाने से क्या होता है?
2. Z·Z और X·X गुणा करें। क्या मिला, और भौतिक मतलब क्या है?
3. S = [[1, 0], [0, i]] के लिए S† निकालें, और जाँचें कि S†S = I।
4. क्या [[1, 0], [0, 2]] unitary है? [[0, i], [i, 0]]? (Column test लगाएँ।)
5. det(Y − λI) = 0 से Y = [[0, −i], [i, 0]] के eigenvalues निकालें।
6. उस gate की matrix लिखें जो |0⟩ → |1⟩ और |1⟩ → −|0⟩ करता है। क्या यह unitary है?

**जवाब:**

1. H|+⟩ = |0⟩ और H|−⟩ = |1⟩। तो HH = I: H अपना ही inverse है।
2. दोनों I देते हैं। दो बार पलटना, या दो बार phase-flip, कुछ नहीं करता।
3. S† = [[1, 0], [0, −i]]। S†S = [[1, 0], [0, (−i)(i)]] = [[1, 0], [0, 1]]। ✓
4. नहीं: दूसरे column की लंबाई 2 है। हाँ: columns [0, i] और [i, 0] दोनों की लंबाई 1 और inner product 0·i + (−i)·0 = 0।
5. det [[−λ, −i], [i, −λ]] = λ² − (−i)(i) = λ² − 1 = 0, तो λ = ±1। (Y Hermitian है, तो वादे के मुताबिक़ real eigenvalues।)
6. Columns outputs हैं: पहला column [0, 1], दूसरा [−1, 0], तो [[0, −1], [1, 0]]। Columns orthonormal: हाँ, unitary। (यह वही XZ है जो आपने पहले निकाला।)

## सार

| विचार | नियम |
|---|---|
| Matrix × vector | हर output entry = row · vector |
| Columns | Column k = basis state k के साथ matrix क्या करती है |
| Outer products से | X = \|1⟩⟨0\| + \|0⟩⟨1\| |
| पहले A फिर B | Matrix BA (पहला gate दाईं ओर) |
| क्रम मायने रखता है | XZ = −ZX |
| Basis की अदला-बदली | HZH = X; H, 0/1 और +/− बदलता है |
| Dagger | A† = conjugate transpose; (AB)† = B†A† |
| Unitary | U†U = I; inverse U† है |
| Gates unitary क्यों | लंबाई 1 रखते हैं, पहचान बनाए रखते हैं, reversible |
| Column test | Unitary ⇔ columns orthonormal |
| Hermitian | A† = A; real eigenvalues; observables |
| Eigen समीकरण | A\|v⟩ = λ\|v⟩ |
| λ निकालना (2×2) | det(A − λI) = 0 |
| Z के eigen | \|0⟩: +1, \|1⟩: −1 |
| X के eigen | \|+⟩: +1, \|−⟩: −1 |
| Unitary eigenvalues | हमेशा phases e^(iθ) |
| Measurement | नतीजे eigenvalues हैं; state eigenvector बन जाती है |
| कोड में | `U.conj().T`, `np.linalg.eig`, Qiskit `Operator(qc)` |
