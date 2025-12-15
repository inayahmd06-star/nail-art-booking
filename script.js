<script>
document.addEventListener("DOMContentLoaded", () => {
  
  /* =========================
     1. CONFIG & DATA
  ========================= */
  // Ganti dengan nomor WhatsApp Seller (Format: 628...)
  const SELLER_WA = "628123456789"; 
  
  // Ganti dengan link pembayaran (Dana/OVO/QRIS/LinkTree)
  const PAYMENT_LINK = "https://linktr.ee/ISIPAYMENTKAMU";

  const services = [
    { name: "Simple Nail Art", price: 30000 },
    { name: "Complete Nail Art", price: 55000 },
    { name: "Perawatan Kuku", price: 25000 },
    { name: "Perawatan Kaki", price: 40000 },
    { name: "Perawatan Muka", price: 45000 },
    { name: "Make Up (Jasa)", price: 100000 }
  ];

  const timeSlots = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  let cart = [];

  // Referensi Element HTML
  const elDate = document.getElementById("date");
  const elTime = document.getElementById("time");
  const elCart = document.getElementById("cart");

  /* =========================
     2. LOGIKA JAM & TANGGAL
  ========================= */
  if (elDate && elTime) {
    elDate.addEventListener("change", () => {
      // Reset pilihan jam
      elTime.innerHTML = '<option value="">Pilih jam</option>';
      
      // Masukkan jam dari array
      timeSlots.forEach(jam => {
        const option = document.createElement("option");
        option.value = jam;
        option.textContent = jam;
        elTime.appendChild(option);
      });
    });
  }

  /* =========================
     3. LOGIKA KERANJANG (CART)
  ========================= */
  
  // Format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  // Fungsi Global: Tambah ke Cart
  window.addToCart = (index) => {
    cart.push(services[index]);
    renderCart();
  };

  // Fungsi Global: Hapus dari Cart
  window.removeItem = (index) => {
    cart.splice(index, 1);
    renderCart();
  };

  // Render Tampilan Cart
  function renderCart() {
    if (cart.length === 0) {
      elCart.innerHTML = "<p style='text-align:center; color:#888;'>Keranjang kosong</p>";
      return;
    }

    elCart.innerHTML = ""; // Bersihkan dulu
    
    cart.forEach((item, index) => {
      // Membuat elemen HTML sesuai style CSS .cart-item
      const itemHTML = `
        <div class="cart-item">
          <div>
            <strong>${item.name}</strong>
            <div style="font-size:0.9em; color:#666;">${formatRupiah(item.price)}</div>
          </div>
          <button onclick="removeItem(${index})">❌</button>
        </div>
      `;
      elCart.innerHTML += itemHTML;
    });
  }

  /* =========================
     4. CHECKOUT (CUSTOMER)
  ========================= */
  window.checkout = () => {
    const dateVal = elDate.value;
    const timeVal = elTime.value;

    // Validasi: Cek apakah data sudah lengkap
    if (cart.length === 0) {
      alert("Keranjang masih kosong, pilih layanan dulu ya! 💅");
      return;
    }
    if (!dateVal || !timeVal) {
      alert("Mohon pilih Tanggal dan Jam booking.");
      return;
    }

    // Input Nomor WA Customer (untuk konfirmasi balik)
    let customerWA = prompt("Masukkan No. WA Kakak untuk konfirmasi (contoh: 08123...):");
    
    if (!customerWA) return; // Jika di-cancel
    
    // Auto-fix nomor WA (08xx -> 628xx)
    if (customerWA.startsWith("0")) {
      customerWA = "62" + customerWA.slice(1);
    }

    // Hitung Total & Buat List Pesanan
    let total = 0;
    let listText = "";
    
    cart.forEach(item => {
      total += item.price;
      listText += `- ${item.name} (${formatRupiah(item.price)})%0A`;
    });

    // Buat Link "Mode Seller" (Link canggih)
    // Link ini akan dikirim ke Seller, jika Seller klik, tampilan web berubah jadi menu konfirmasi
    const currentURL = window.location.href.split('?')[0]; 
    const sellerLink = `${currentURL}?mode=seller&wa=${customerWA}&date=${dateVal}&time=${timeVal}&total=${total}`;

    // Susun Pesan WhatsApp
    const msg = 
      `Halo Kak, saya mau booking! 💖%0A%0A` +
      `*Detail Pesanan:*%0A` +
      `${listText}%0A` +
      `📅 Tanggal: ${dateVal}%0A` +
      `⏰ Jam: ${timeVal}%0A` +
      `💰 *Total: ${formatRupiah(total)}*%0A%0A` +
      `Mohon info pembayarannya ya.%0A` +
      `-----------------------%0A` +
      `👇 *Link Konfirmasi (Khusus Admin):*%0A` +
      `${encodeURIComponent(sellerLink)}`;

    // Buka WhatsApp
    window.open(`https://wa.me/${SELLER_WA}?text=${msg}`, "_blank");

    // Opsi Buka Payment Gateway (Opsional)
    if(confirm("Apakah ingin membuka link pembayaran sekarang?")) {
      window.open(PAYMENT_LINK, "_blank");
    }
  };

  /* =========================
     5. MODE SELLER (AUTO-DETECT)
  ========================= */
  // Bagian ini hanya aktif jika Seller mengklik link konfirmasi
  const params = new URLSearchParams(window.location.search);
  
  if (params.get("mode") === "seller") {
    const wa = params.get("wa");
    const date = params.get("date");
    const time = params.get("time");
    const total = Number(params.get("total"));

    // Timpa seluruh tampilan body dengan tampilan khusus Admin
    document.body.innerHTML = `
      <div style="max-width:400px; margin:50px auto; font-family:sans-serif; text-align:center;">
        <div style="background:white; padding:30px; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.1); border-top: 5px solid #25d366;">
          <h2 style="color:#25d366; margin-top:0;">🔐 Mode Admin</h2>
          <p style="color:#666;">Konfirmasi pembayaran customer.</p>
          <hr style="border:0; border-top:1px dashed #ddd; margin:20px 0;">
          
          <div style="text-align:left;">
             <p><strong>Customer:</strong> <a href="https://wa.me/${wa}">+${wa}</a></p>
             <p><strong>Tanggal:</strong> ${date}</p>
             <p><strong>Jam:</strong> ${time}</p>
             <p style="font-size:1.2rem; color:#d81b60;"><strong>Total: ${formatRupiah(total)}</strong></p>
          </div>

          <button id="btnConfirm" style="width:100%; padding:15px; margin-top:20px; background:#25d366; color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer; font-size:1rem;">
            ✅ Kirim Tiket Lunas
          </button>
          
          <br><br>
          <a href="${window.location.pathname}" style="color:#999; text-decoration:none; font-size:0.9rem;">&larr; Kembali ke Home</a>
        </div>
      </div>
    `;

    // Aksi Tombol Konfirmasi Seller
    document.getElementById("btnConfirm").addEventListener("click", () => {
      const replyMsg = 
        `Halo Kak! Pembayaran sudah diterima ✅%0A%0A` +
        `Booking kamu pada *${date} jam ${time}* sudah CONFIRMED.%0A` +
        `Sampai jumpa di lokasi ya! 💅`;
      
      window.location.href = `https://wa.me/${wa}?text=${replyMsg}`;
    });
  }

});
</script>