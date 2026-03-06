<div align="center">

![](./public//imgs/bg2.png)

<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/ConardLi/easy-dataset">
<img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/ConardLi/easy-dataset/total">
<img alt="GitHub Release" src="https://img.shields.io/github/v/release/ConardLi/easy-dataset">
<img src="https://img.shields.io/badge/license-AGPL--3.0-green.svg" alt="AGPL 3.0 License"/>
<img alt="GitHub contributors" src="https://img.shields.io/github/contributors/ConardLi/easy-dataset">
<img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/ConardLi/easy-dataset">
<a href="https://arxiv.org/abs/2507.04009v1" target="_blank">
  <img src="https://img.shields.io/badge/arXiv-2507.04009-b31b1b.svg" alt="arXiv:2507.04009">
</a>

<a href="https://trendshift.io/repositories/13944" target="_blank"><img src="https://trendshift.io/api/badge/repositories/13944" alt="ConardLi%2Feasy-dataset | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

**Büyük Dil Modelleri için ince ayar veri setleri oluşturmak için güçlü bir araç**

[简体中文](./README.zh-CN.md) | [English](./README.md) | [Türkçe](./README.tr.md)

[Özellikler](#özellikler) • [Hızlı Başlangıç](#yerel-çalıştırma) • [Dokümantasyon](https://docs.easy-dataset.com/ed/en) • [Katkıda Bulunma](#katkıda-bulunma) • [Lisans](#lisans)

Bu projeyi beğendiyseniz, lütfen bir Yıldız⭐️ verin veya yazara bir kahve ısmarlayın => [Bağış](./public/imgs/aw.jpg) ❤️!

</div>

## Genel Bakış

Easy Dataset, Büyük Dil Modelleri (LLM'ler) için özel olarak tasarlanmış ince ayar veri setleri oluşturmak için bir uygulamadır. Alana özgü dosyaları yüklemek, içeriği akıllıca bölmek, sorular oluşturmak ve model ince ayarı için yüksek kaliteli eğitim verileri üretmek için sezgisel bir arayüz sağlar.

Easy Dataset ile alan bilgisini yapılandırılmış veri setlerine dönüştürebilir, OpenAI formatını takip eden tüm LLM API'leriyle uyumlu çalışabilir ve ince ayar sürecini basit ve verimli hale getirebilirsiniz.

![](./public/imgs/arc3.png)

## Özellikler

- **Akıllı Belge İşleme**: PDF, Markdown, DOCX dahil birden fazla formatın akıllı tanınması ve işlenmesi desteği
- **Akıllı Metin Bölme**: Birden fazla akıllı metin bölme algoritması ve özelleştirilebilir görsel segmentasyon desteği
- **Akıllı Soru Üretimi**: Her metin bölümünden ilgili soruları çıkarır
- **Alan Etiketleri**: Veri setleri için global alan etiketlerini akıllıca oluşturur, küresel anlama yeteneklerine sahiptir
- **Cevap Üretimi**: Kapsamlı cevaplar ve Düşünce Zinciri (COT) oluşturmak için LLM API kullanır
- **Esnek Düzenleme**: Sürecin herhangi bir aşamasında soruları, cevapları ve veri setlerini düzenleyin
- **Çoklu Dışa Aktarma Formatları**: Veri setlerini çeşitli formatlarda (Alpaca, ShareGPT, çok dilli düşünme) ve dosya türlerinde (JSON, JSONL) dışa aktarın
- **Geniş Model Desteği**: OpenAI formatını takip eden tüm LLM API'leriyle uyumlu
- **Tam Türkçe Dil Desteği**: Tüm arayüz ve AI işlemleri için eksiksiz Türkçe çeviriler 🇹🇷
- **Kullanıcı Dostu Arayüz**: Hem teknik hem de teknik olmayan kullanıcılar için tasarlanmış sezgisel kullanıcı arayüzü
- **Özel Sistem İstemleri**: Model yanıtlarını yönlendirmek için özel sistem istemleri ekleyin

## Hızlı Demo

https://github.com/user-attachments/assets/6ddb1225-3d1b-4695-90cd-aa4cb01376a8

## Yerel Çalıştırma

### İstemciyi İndirin

<table style="width: 100%">
  <tr>
    <td width="20%" align="center">
      <b>Windows</b>
    </td>
    <td width="30%" align="center" colspan="2">
      <b>MacOS</b>
    </td>
    <td width="20%" align="center">
      <b>Linux</b>
    </td>
  </tr>
  <tr style="text-align: center">
    <td align="center" valign="middle">
      <a href='https://github.com/ConardLi/easy-dataset/releases/latest'>
        <img src='./public/imgs/windows.png' style="height:24px; width: 24px" />
        <br />
        <b>Setup.exe</b>
      </a>
    </td>
    <td align="center" valign="middle">
      <a href='https://github.com/ConardLi/easy-dataset/releases/latest'>
        <img src='./public/imgs/mac.png' style="height:24px; width: 24px" />
        <br />
        <b>Intel</b>
      </a>
    </td>
    <td align="center" valign="middle">
      <a href='https://github.com/ConardLi/easy-dataset/releases/latest'>
        <img src='./public/imgs/mac.png' style="height:24px; width: 24px" />
        <br />
        <b>M</b>
      </a>
    </td>
    <td align="center" valign="middle">
      <a href='https://github.com/ConardLi/easy-dataset/releases/latest'>
        <img src='./public/imgs/linux.png' style="height:24px; width: 24px" />
        <br />
        <b>AppImage</b>
      </a>
    </td>
  </tr>
</table>

### NPM ile Kurulum

```bash
npm install
npm run db:push
npm run dev
```

### Docker ile Kurulum

```bash
docker-compose up -d
```

Ardından `http://localhost:1717` adresine gidin.

## Desteklenen AI Sağlayıcıları

Easy Dataset, aşağıdakiler dahil olmak üzere birden fazla AI sağlayıcısını destekler:

- **OpenAI**: GPT-4, GPT-3.5-turbo ve diğer modeller
- **Ollama**: Yerel model çalıştırma
- **智谱AI (GLM)**: Çince modeller
- **OpenRouter**: Çoklu model aggregatör
- **Özel API Uç Noktaları**: OpenAI formatını takip eden herhangi bir API

## Proje Yapısı

```
easy-dataset/
├── app/                    # Next.js uygulama yönlendiricisi
│   ├── api/               # API rotaları
│   ├── projects/          # Proje sayfaları
│   └── dataset-square/    # Veri seti galerisi
├── components/            # React bileşenleri
├── lib/                   # Temel kütüphaneler
│   ├── llm/              # LLM entegrasyonu
│   ├── db/               # Veritabanı erişimi
│   ├── file/             # Dosya işleme
│   └── services/         # İş mantığı
├── locales/              # i18n çevirileri
│   ├── en/              # İngilizce
│   ├── zh-CN/           # Basitleştirilmiş Çince
│   └── tr/              # Türkçe
├── prisma/               # Veritabanı şeması
└── electron/             # Electron masaüstü uygulaması
```

## Kullanım Rehberi

### 1. Proje Oluşturma

İlk olarak, yeni bir proje oluşturun ve proje adını, açıklamasını ve diğer temel bilgileri yapılandırın.

### 2. Dosya Yükleme

Alana özgü belgelerinizi yükleyin. Desteklenen formatlar:

- PDF
- Markdown (.md)
- Microsoft Word (.docx)
- EPUB
- Düz metin (.txt)

### 3. Metin Bölme

Dosyalar aşağıdaki yöntemlerle akıllıca bölünebilir:

- Doğal dil işleme tabanlı semantik bölme
- Özel ayırıcılara dayalı bölme
- Karakter sayısına dayalı sabit boyutlu bölme
- Manuel görsel bölme

### 4. Alan Etiketleri Oluşturma

Sistem, belge içeriğine dayalı olarak otomatik olarak hiyerarşik alan etiketleri oluşturabilir ve iki seviyeyi destekler.

### 5. Soru Üretimi

Her metin bloğu için sistem:

- İçeriğe dayalı alakalı sorular oluşturur
- Tür ve hedef kitle perspektifi sorgulamayı destekler
- Soru sayısını özelleştirme seçeneği sunar

### 6. Cevap Üretimi

Yapılandırılmış LLM API'si kullanarak:

- Her soru için kapsamlı cevaplar oluşturur
- Düşünce Zinciri (COT) üretimini destekler
- Farklı cevap şablonları destekler

### 7. Veri Seti Dışa Aktarma

Veri setinizi çeşitli formatlarda dışa aktarın:

- **Alpaca Format**: Basit talimat-takip formatı
- **ShareGPT Format**: Çok turlu konuşma formatı
- **Çok Dilli Düşünme**: COT ile genişletilmiş format
- **Özel Format**: Kendi JSON yapınızı tanımlayın

Dışa aktarma hedefleri:

- Yerel dosya sistemi
- Hugging Face Hub
- LLaMA Factory uyumluluğu

## Gelişmiş Özellikler

### Veri Damıtma

Mevcut veri setlerinden yeni eğitim örnekleri oluşturun:

- Soru damıtma: Mevcut soru-cevap çiftlerinden yeni sorular oluşturun
- Etiket damıtma: Otomatik etiket ve kategorizasyon oluşturma

### Tür-Hedef Kitle (GA) Çiftleri

Spesifik içerik stilleri ve hedef kitleler için veri setlerini uyarlayın:

- Tür: Akademik, teknik, yaratıcı yazma, vb.
- Hedef Kitle: Yeni başlayanlar, uzmanlar, öğrenciler, vb.

### Toplu İşlemler

Birden fazla öğeye verimli bir şekilde işlem:

- Toplu soru üretimi
- Toplu cevap üretimi
- Toplu veri seti dışa aktarma

### Görev Yönetimi

Tüm arka plan görevlerini izleyin ve yönetin:

- Dosya işleme görevleri
- Soru üretim görevleri
- Cevap üretim görevleri
- Dışa aktarma görevleri

## Yapılandırma

### LLM API Yapılandırması

Ayarlar sayfasında LLM API'nizi yapılandırın:

1. **Sağlayıcı**: OpenAI, Ollama, 智谱AI veya özel seçin
2. **API Anahtarı**: API anahtarınızı girin (gerekirse)
3. **Model**: Kullanılacak modeli seçin
4. **Temel URL**: Özel API'ler için temel URL'yi ayarlayın

### Görev Ayarları

Görev yürütme parametrelerini özelleştirin:

- Soru üretimi için eşzamanlılık
- Cevap üretimi için eşzamanlılık
- Varsayılan soru sayısı
- Varsayılan cevap şablonu

### Özel İstemler

Her görev türü için özel sistem istemleri ekleyin:

- Soru üretim istemi
- Cevap üretim istemi
- Etiket üretim istemi
- Damıtma istemi

## Katkıda Bulunma

Katkılara hoş geldiniz! Lütfen şu adımları izleyin:

1. Repo'yu fork edin
2. Bir özellik dalı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Dala push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request açın

## Lisans

Bu proje AGPL-3.0 Lisansı altında lisanslanmıştır. Detaylar için [LICENSE](./LICENSE) dosyasına bakın.

## İletişim

- **GitHub Issues**: [Yeni bir sorun oluşturun](https://github.com/ConardLi/easy-dataset/issues)
- **Email**: lhj19950927@gmail.com
- **WeChat Grubu**: README'deki QR koduna bakın

## Alıntı

Bu aracı araştırmanızda kullanırsanız, lütfen şu şekilde alıntı yapın:

```bibtex
@misc{easy-dataset-2025,
  title={Easy Dataset: A Tool for Creating Fine-tuning Datasets for Large Language Models},
  author={Conard Li},
  year={2025},
  publisher={GitHub},
  howpublished={\url{https://github.com/ConardLi/easy-dataset}}
}
```

## Teşekkürler

Bu proje aşağıdaki harika açık kaynak projelerini kullanır:

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Prisma](https://www.prisma.io/)
- [Electron](https://www.electronjs.org/)

---

<div align="center">
⭐️ Bu projeyi beğendiyseniz, lütfen bir yıldız verin! ⭐️
</div>
