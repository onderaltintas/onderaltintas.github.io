## 3D Spiral Kartlar – Three.js Bildirim Stack Deneyi

Bu repo, dikey bir bildirim yığınına benzeyen kartları **3D spiral / sinüs** hattına yerleştirip,
fare ve dokunmatik jestlerle etkileşimli olarak gezebileceğin bir demo içerir.

- Kartlar, dikey eksen boyunca uzayan bir spiral çizgi üzerinde konumlanır.
- Alt kısma yakın kartlar daha küçük, yukarı doğru çıktıkça büyüyerek **derinlik hissi** verir.
- **Fare / dokunmatik sürükleme** ile spiral boyunca yukarı–aşağı gezilir.
- **Mouse wheel / pinch zoom** ile spiral genişliği (sinüs amplitüdü) değiştirilir.
- Kartlar renkli, animasyonlu ve tıklanabilir (hafif vurgu efekti).

İlham kaynağı: [x.com/wojakdeveloper](https://x.com/wojakdeveloper/status/2000953144453517390)

---

### Proje Yapısı

- `index.html`  
  Ana Three.js sahnesi. Kartların spiral boyunca oluşturulması, animasyon döngüsü ve
  mouse/touch etkileşimlerinin tamamı bu dosyanın içindedir.

- `preview.html`  
  (Senin tarafında yeniden adlandırılan önceki dokümantasyon/önizleme sayfası.)  
  İstersen bu sayfayı bir **mobil cihaz çerçevesi** içinde önizleme ve geliştirici notları için
  kullanabilirsin; GitHub Pages üzerinde de güzel bir “landing + demo” sayfası işlevi görebilir.

Bu repo saf HTML/JS dosyalarından oluşur; ek build adımı veya bundler gerekmez.

---

### Kullanılan Teknolojiler

- **Three.js** – 3D sahne, kamera, ışıklar ve kart geometri/materyalleri
- **Vanilla JS** – Jest hesaplama, etkileşim ve animasyon döngüsü
- **ES Module import** – Three.js doğrudan CDN üzerinden `type="module"` ile import edilir

Three.js import satırı özetle şu şekildedir:

```html
<script type="module">
  import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
  // ...
</script>
```

---

### Çalıştırma

Projeyi GitHub’a push ettikten sonra:

1. Dosyaları klonla:
   ```bash
   git clone https://github.com/<kullanıcı-adın>/<repo-adı>.git
   cd <repo-adı>
   ```
2. Basit bir statik sunucu ile aç (örnek: Python):
   ```bash
   python -m http.server 3000
   ```
3. Tarayıcıdan:
   - `http://localhost:3000/index.html` → Ana spiral kart sahnesi  
   - `http://localhost:3000/preview.html` → (varsa) dokümantasyon / mobil önizleme

Alternatif olarak, bu repo doğrudan **GitHub Pages** ile de servis edilebilir; ana giriş
noktası olarak `index.html` veya `preview.html` seçebilirsin.

---

### Nasıl GitHub Projesine Dönüştürülür?

1. Bu klasörü yeni bir git reposu olarak başlat:
   ```bash
   git init
   git add .
   git commit -m "Initial 3D spiral cards demo"
   ```
2. GitHub’da boş bir repo oluştur (örneğin `swrill-cards`).
3. Uzaktan origin ekle ve push et:
   ```bash
   git remote add origin https://github.com/<kullanıcı-adın>/swrill-cards.git
   git push -u origin main
   ```
4. İstersen GitHub Pages’i açarak bu projeyi canlıya alabilirsin.

---

### Geliştirici Notu

Bu demo, konsept ve etkileşim prototipi olarak tasarlanmıştır.  
Gerçek ürün ortamında:

- Kart verilerini harici bir API’den çekmek,
- Performans için kart sayısını dinamik yönetmek,
- Erişilebilirlik (klavye gezilebilirlik, ARIA etiketleri) eklemek

gibi katmanlarla rahatlıkla genişletilebilir.

\
Geliştirici notları · **Halit YEŞİL** · [halityesil.com](https://halityesil.com)


