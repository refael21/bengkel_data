from django.db import models # Modul yang menyediakan tipe variabel/kolom database
# Seperti ChardField, IntegerField, DateTimeField, dan lain-lain. Modul ini juga menyediakan class Model yang digunakan untuk membuat model database.

class Category(models.Model): # Membuat class atau model yang saya namai Category
    name = models.CharField(max_length=100) # Tipe data yang dibuat python untuk teks pendek dengan maksimal 100 karakter

    def __str__(self): # method atau metode dari bawaan python untuk menentukan teks dari sebuah objek
        return self.name # mengembalikan teks yang sudah dipanggil

class Service(models.Model): # Membuat tabel data pelayanan atau service
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='services') # Mmebuat pengubung antar tabel ke kategori
    name = models.CharField(max_length=150) # Nama Pelayanan
    estimated_duration = models.CharField(max_length=50) # Contoh "2 jam", "3 jam"
    price = models.DecimalField(max_digits=10, decimal_places=2) # Harga

    def __str__(self):
        return self.name # menampilkan variabel dari nama pelayanan

class Booking(models.Model): # Membuat tabel database pemesanan atau Booking
    STATUS_CHOICE = [ # Membuat list yang akan ditampilkan pada status unit
        ('pending', 'Pending'),
        ('diproses', 'Diproses'),
        ('selesai', 'Selesai'),
        ('batal', 'Batal')
    ]
# Syntax diatas adalah list didalam nya saya kasih tipe data Tuple agar hasil nya berurutan

    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    car_model = models.CharField(max_length=100)
    car_plate = models.CharField(max_length=20)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings') # model.CASCADE menununjukkan agar jika suatu service maka booking terkait juga ikut terhapus juga
    status = models.CharField(max_length=20, choices=STATUS_CHOICE, default='pending') # default='pending' artinya saat booking pertama kali otomatis berstatus pending
    booking_date = models.DateTimeField(auto_now_add=True) # auto_now_add=True artinya saat booking pertama kali otomatis akan mengambil tanggal dan waktu saat itu juga

    def __str__(self):
        return f"{self.customer_name} - {self.car_plate}" # menampilkan nama customer dan plat nomor mobil yang di booking tanda " - " sebagai pemisah saja agar rapih