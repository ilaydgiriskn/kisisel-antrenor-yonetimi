# Kişisel Antrenör (Personal Trainer) Uygulaması - Teknik Uygulama Planı

Bu döküman, antrenörlerin ve danışanlarının etkileşimde bulunabileceği, Supabase mimarisine dayalı Kişisel Antrenör (Personal Trainer) uygulamasının MVP odaklı teknik uygulama planıdır. İlettiğiniz eksik noktalar, veritabanı ilişkileri ve rol bazlı güvenlik gereksinimleri bu plana entegre edilmiştir.

## User Review Required

> [!IMPORTANT]
> Plana yeni eklenen **Danışan Davet Sistemi** (Supabase Auth üzerinden) ve **Paket Sistemi** mantığı aşağıda detaylandırılmıştır. Bu akışların mevcut iş süreçlerinize tam olarak uygunluğunu kontrol etmeniz rica olunur. Ayrıca şu an için herhangi bir frontend framework (React, Next.js vb.) belirtilmediğinden, plan genel bir mimari olarak hazırlanmıştır.

## Open Questions

> [!WARNING]
> * Ödeme entegrasyonu (Iyzico, Stripe vb.) sistem üzerinden otomatik mi planlanıyor, yoksa ödemeler ve kalan tutarlar uygulamada sadece manuel kayıt olarak mı tutulacak? (Planda manuel takip mantığı kurgulanmıştır.)
> * Danışan silme işlemi kalıcı silme mi olmalı yoksa sadece `active: false` yapılarak arşivleme (soft delete) mantığıyla mı çalışmalı?

---

## Proposed Changes

### 1. Rol Bazlı Kimlik Doğrulama (Role-Based Authentication)

Sisteme hem antrenörlerin hem de danışanların giriş yapabilmesi sağlanacaktır.
* **Profiller ve Rol Yönetimi:** Kullanıcının rol bilgisi `profiles` tablosunda `role` kolonu ile tutulacaktır. (Değerler: `trainer`, `client`)
* **Auth Akışları:** 
  * Trainer Register & Login
  * Client Login
* **Role-Based Authorization & Protected Routes:**
  * İstemci (Frontend) tarafında role bağlı korumalı rotalar uygulanacaktır.
  * Danışanlar sisteme giriş yaptıklarında kendilerine atanmış antrenman programlarını görebilecek, antrenmanlarını "tamamlandı" olarak işaretleyebilecek, yeni ölçüm girebilecek ve ilerleme (progress) fotoğrafı yükleyebileceklerdir.

---

### 2. Veritabanı Şeması ve İlişkileri

Supabase PostgreSQL üzerinde tablolar ve birbirleri arasındaki ilişkiler (One-to-One / One-to-Many) aşağıdaki gibi kurulacaktır:

* **profiles** (1) → (1) **clients** : *One-to-One* (Her client kullanıcısının tek bir profile kaydı vardır. Kullanıcı hesabıyla danışan detaylarını eşleştirir.)
* **profiles** (1) → (N) **clients** : *One-to-Many* (Bir trainer profilinin ise birçok client kaydı olabilir. Bu ilişki `trainer_id` üzerinden kurulur ve antrenörün danışanlarını belirler.)
* **clients** (1) → (N) **measurements** : *One-to-Many*
* **clients** (1) → (N) **workout_programs** : *One-to-Many*
* **workout_programs** (1) → (N) **workout_exercises** : *One-to-Many*
* **clients** (1) → (N) **progress_photos** : *One-to-Many*
* **clients** (1) → (N) **payments** : *One-to-Many*
* **packages** (1) → (N) **payments** : *One-to-Many*

---

### 3. Veritabanı Tablo Yapıları

#### `profiles` Tablosu
Kullanıcı giriş ve rol bilgilerini barındırır. Supabase `auth.users` ile bağlantılıdır.
* `id` (UUID, PK)
* `role` (String, 'trainer' veya 'client')
* `full_name` (String)
* `created_at` (Timestamp)

#### `clients` Tablosu
Danışan bilgileri ile kullanıcı hesabını birbirinden ayıran, tüm danışan detaylarının tutulduğu tablo.
* `id` (UUID, PK)
* `trainer_id` (UUID, FK -> profiles.id)
* `profile_id` (UUID, FK -> profiles.id) - *Danışan Auth hesabı ile eşleştirme*
* `phone` (String)
* `birth_date` (Date)
* `gender` (String)
* `goal` (String)
* `active` (Boolean, default: true)
* `remaining_sessions` (Integer, default: 0)
* `notes` (Text)
* `created_at` (Timestamp)

#### `measurements` Tablosu
Danışanların zaman içerisindeki fiziksel gelişimlerini takip etmek için kullanılır.
* `id` (UUID, PK)
* `client_id` (UUID, FK -> clients.id)
* `weight` (Numeric)
* `body_fat` (Numeric)
* `waist` (Numeric)
* `hip` (Numeric)
* `chest` (Numeric)
* `arm` (Numeric)
* `leg` (Numeric)
* `shoulder` (Numeric)
* `measurement_date` (Date)
* `created_at` (Timestamp)

#### `workout_programs` Tablosu
* `id` (UUID, PK)
* `client_id` (UUID, FK -> clients.id)
* `title` (String)
* `status` (String) - *Örn: 'active', 'completed', 'draft'*
* `start_date` (Date)
* `end_date` (Date)
* `created_at` (Timestamp)
* `updated_at` (Timestamp)

#### `workout_exercises` Tablosu
* `id` (UUID, PK)
* `workout_program_id` (UUID, FK -> workout_programs.id)
* `exercise_name` (String)
* `sets` (Integer)
* `reps` (String / Integer)
* `weight` (String / Numeric)
* `rest_time` (String)
* `completed` (Boolean, default: false)

#### `progress_photos` Tablosu
* `id` (UUID, PK)
* `client_id` (UUID, FK -> clients.id)
* `photo_url` (String) - *Supabase Storage linki*
* `note` (Text)
* `uploaded_at` (Timestamp)

#### `packages` (Paket Sistemi)
* `id` (UUID, PK)
* `trainer_id` (UUID, FK -> profiles.id)
* `title` (String)
* `session_count` (Integer)
* `price` (Numeric)

#### `payments` (Ödemeler)
* `id` (UUID, PK)
* `client_id` (UUID, FK -> clients.id)
* `package_id` (UUID, FK -> packages.id)
* `paid_amount` (Numeric)
* `remaining_amount` (Numeric)
* `payment_date` (Timestamp)

---

### 4. Danışan Yönetimi (CRUD ve Davet Sistemi)

**Danışan Davet Sistemi (Akış):**
1. **Danışan Oluştur:** Trainer, sistemde yeni bir danışan kaydı oluşturur.
2. **Davet Gönder:** Supabase Auth kullanılarak kullanıcının e-posta adresine bir `Invite` linki gönderilir.
3. **Şifre Belirleme:** Danışan davet linkine tıklayarak kendi şifresini belirler.
4. **Hesap Aktif Olur:** Danışan, `client` rolüyle sisteme giriş yapar.

**Danışan CRUD İşlemleri:**
* **Danışan Ekle:** Trainer yeni danışan profili oluşturur.
* **Danışan Listele:** Trainer sadece kendi danışanlarını görebilir.
* **Danışan Güncelle:** Danışanın kalan ders sayısı, hedefleri, aktiflik durumu vb. güncellenebilir.
* **Danışan Sil:** Danışan kaydı silinir veya pasife (arşive) alınır.

**Antrenman Programı Oluşturma ve Atama Akışı (MVP):**
1. **Program Oluşturma:** Trainer yeni bir antrenman programı oluşturur.
2. **Egzersiz Ekleme:** Program içerisine hareketler (set, tekrar, ağırlık vb.) eklenir.
3. **Atama:** Program ilgili danışana atanır.
4. **Görüntüleme:** Danışan giriş yaptığında yalnızca kendisine atanmış aktif programları görüntüleyebilir.
5. **Tamamlama:** Danışan, yaptığı egzersizleri sistem üzerinden "tamamlandı" olarak işaretleyebilir.

---

### 5. Dashboard İçeriği
Antrenör (Trainer) panele girdiğinde aşağıdaki özet verileri görecektir:
* **Toplam danışan sayısı**
* **Aktif danışan sayısı** (`active: true` olanlar)
* **Yaklaşan antrenmanlar** (`workout_programs` tablosunda güncel tarihte/yaklaşan programlar)
* **Bitmek üzere olan ders paketleri** (`clients.remaining_sessions` değeri kritik eşiğin altına düşenler)
* **Bekleyen ödemeler** (`payments.remaining_amount > 0` olanlar)

---

## Verification Plan

### Supabase RLS (Row Level Security) & Yetki Doğrulamaları
- [ ] **Kayıt ve Davet Testi:** Trainer hesabı başarıyla oluşturulabiliyor mu? Davet e-postası ile Client hesabı oluşturulabiliyor mu?
- [ ] **Role Bazlı Yetkilendirme Kontrolü:** Trainer hesapları dashboard ve yönetim ekranlarına girebilirken, Client hesaplarının buralara erişimi engelleniyor mu?
- [ ] **Trainer Veri İzolasyonu:** Trainer yalnızca kendisine bağlı danışanların verilerini (`trainer_id` ile) listeleyebiliyor ve güncelleyebiliyor mu?
- [ ] **Client Veri İzolasyonu:** Danışan (Client) login olduğunda sadece kendisine ait antrenman, ölçüm, ödeme ve gelişim fotoğraflarına erişebiliyor mu?
- [ ] **Client Etkileşim Testi:** Danışan bir egzersizi başarıyla "tamamlandı" olarak işaretleyip yeni bir gelişim fotoğrafı yükleyebiliyor mu?
- [ ] **RLS Testi:** Veritabanına doğrudan yetkisiz API sorgusu atıldığında Supabase Row Level Security (RLS) politikaları erişimi başarıyla engelliyor mu?
  * **Trainer Yetkileri:** Kendi danışanlarını görüntüleyebilir, oluşturabilir, güncelleyebilir ve silebilir (veya pasife alabilir). Kendi danışanlarının ölçümlerini, programlarını, ödemelerini ve fotoğraflarını yönetebilir.
  * **Client Yetkileri:** Sadece kendisine ait verilere erişebilir. Sadece kendi ilerleme fotoğrafını yükleyebilir, kendi ölçümlerini ekleyebilir, kendisine atanmış programları görüntüleyebilir ve egzersizleri tamamlandı olarak işaretleyebilir.
