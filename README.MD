# Nama    : Refael Frances Havergal Sibarani
# Project : Website Bengkel Mobil

## Latar Belakang Project
Project Website Bengkel data ini adalah sebuah platform yang dikembangkang sebagai wadah pembelajaran dan pengembangan kemampuan di bidang Backend. Website ini bertujuan untuk menyediakan informasi tentang pemeliharaan dan kerusakan mobil. Melalui project saya ini diharapkan dapat membantu dan menjadi referensi wawasan dalam bidang software terkhususnya Backend Engineer.

## Setup Yang Dipersiapkan
1. Install MySQL Server versi 26.7 melalui link berikut https://dev.mysql.com/downloads/mysql/?platform&os=3 
2. Install Python versi 3.14.2 melalui link berikut https://www.python.org/downloads/release/python-3142/ 
3. Letakan File MYSQL SERVER DAN PYTHON di environment variable.
4. Tambahkan extensions MYSQL dan Live Server di VSCode
5. Buka terminal dalam VSCode dan ketik perintah "python -m venv venv" untuk package tidak tercampur dengan python global.
6. aktifkan Virtual Environment dengan perintah "venv\Scripts\activate", dan pastikan muncul (venv) berwarna hijau.
7. upgrade pip dengan perintah "python -m pip install --upgrade pip"
8. Install semua package yang dibutuhkan dengan perintah "pip install django djangorestframework django-cors-headers python-decouple PyMySQL"
   - django : Framework utama backend
   - djangorestframework : Membuat API (REST API)
   - django-cors-headers : Mengizinkan frontend mengakses API (CORS)
   - python-decouple : Membaca file.env (database, dll)
   - PyMySQL : Koneksi Django ke MySQL
9. Simpan daftar package ke requirements.txt dengan perintah "python -m pip freeze > requirements.txt"
10. jika ingin install ulang ketik perintah "pip install -r requirements.txt"
11. jika ingin di cek apakah sudah terinstall ketik perintah "pip list"

## Ringkasan
python -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
pip install django djangorestframework django-cors-headers python-decouple PyMySQL
pip freeze > requirements.txt

## Hal yang perlu dipastikan
1. Pastikan file .env sudah ada
2. jalankan migrasi dengan perintah "python manage.py migrate"
3. jalankan server dengan perintah "python manage.py runserver"