// جلوگیری از زوم روی موبایل (خصوصاً iOS)
document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});

document.addEventListener('gesturechange', function(e) {
    e.preventDefault();
});

document.addEventListener('gestureend', function(e) {
    e.preventDefault();
});

// جلوگیری از دابل تپ برای زوم
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// بقیه کد...
document.addEventListener('DOMContentLoaded', function() {
    // کد قبلی...
});

document.addEventListener('DOMContentLoaded', function() {
    // المان‌ها
    const modal = document.getElementById('accountModal');
    const reportModal = document.getElementById('reportModal');
    const passwordModal = document.getElementById('passwordModal');
    const deleteModal = document.getElementById('deleteModal');
    
    const closeBtn = document.querySelector('.account-close');
    const closeReport = document.getElementById('closeReport');
    const closePassword = document.getElementById('closePassword');
    const closeDelete = document.getElementById('closeDelete');
    
    const cancelBtn = document.querySelector('.btn-cancel');
    const cancelPassword = document.getElementById('cancelPassword');
    const cancelDelete = document.getElementById('cancelDelete');
    
    const accountForm = document.getElementById('accountForm');
    const passwordForm = document.getElementById('passwordForm');
    const deleteForm = document.getElementById('deleteForm');
    
    const accountList = document.getElementById('accountList');
    const monthFilter = document.getElementById('monthFilter');
    const reportTableBody = document.getElementById('reportTableBody');
    const cards = document.querySelectorAll('.card');
    
    let accountCard = null, reportCard = null, profileCard = null;
    let deleteTargetId = null;

    // پیدا کردن کارت‌ها
    cards.forEach(card => {
        const title = card.querySelector('.card-title');
        if(title) {
            if(title.textContent.includes('مدیریت حساب')) accountCard = card;
            if(title.textContent.includes('گزارش‌های مدیریتی')) reportCard = card;
            if(title.textContent.includes('پروفایل و رمز عبور')) profileCard = card;
        }
    });

    // باز کردن پاپ‌آپ‌ها
    if(accountCard) accountCard.addEventListener('click', () => {modal.style.display='block'; loadAccounts();});
    if(reportCard) reportCard.addEventListener('click', () => {reportModal.style.display='block'; loadReports(monthFilter.value);});
    if(profileCard) profileCard.addEventListener('click', () => passwordModal.style.display='block');
    
    closeBtn?.addEventListener('click', ()=>modal.style.display='none');
    closeReport?.addEventListener('click',()=>reportModal.style.display='none');
    closePassword?.addEventListener('click',()=>passwordModal.style.display='none');
    closeDelete?.addEventListener('click',()=>deleteModal.style.display='none');
    
    cancelBtn?.addEventListener('click',()=>{modal.style.display='none'; accountForm.reset();});
    cancelPassword?.addEventListener('click',()=>passwordModal.style.display='none');
    cancelDelete?.addEventListener('click',()=>deleteModal.style.display='none');
    
    window.addEventListener('click',e=>{
        if(e.target===modal) modal.style.display='none';
        if(e.target===reportModal) reportModal.style.display='none';
        if(e.target===passwordModal) passwordModal.style.display='none';
        if(e.target===deleteModal) deleteModal.style.display='none';
    });
    
    monthFilter?.addEventListener('change', function(){loadReports(this.value);});

    // ذخیره تراکنش
    accountForm.addEventListener('submit', function(e){
        e.preventDefault();
        const type = document.querySelector('input[name="transactionType"]:checked').value;
        const title = document.getElementById('accountTitle').value.trim();
        const amount = parseInt(document.getElementById('accountAmount').value);
        const owner = document.getElementById('accountOwner').value.trim() || 'نامشخص';
        const now = new Date();
        if(!title||!amount) return;
        const acc = {
            id: Date.now(),
            type: type,
            title: title,
            amount: amount,
            owner: owner,
            date: now.toLocaleDateString('fa-IR'),
            time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: now.getTime()
        };
        let accounts = JSON.parse(localStorage.getItem('accounts')||'[]');
        accounts.push(acc);
        localStorage.setItem('accounts', JSON.stringify(accounts));
        alert('✅ تراکنش ذخیره شد!');
        accountForm.reset();
        loadAccounts();
    });

    // ذخیره رمز عبور
    passwordForm.addEventListener('submit', function(e){
        e.preventDefault();
        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const savedPass = localStorage.getItem('appPassword');
        
        if(savedPass && savedPass !== current){
            alert('❌ رمز عبور فعلی اشتباه است!');
            return;
        }
        localStorage.setItem('appPassword', newPass);
        alert('✅ رمز عبور با موفقیت ذخیره شد!');
        passwordModal.style.display='none';
        passwordForm.reset();
    });

    // حذف تراکنش
    deleteForm.addEventListener('submit', function(e){
        e.preventDefault();
        const pass = document.getElementById('deletePassword').value;
        const savedPass = localStorage.getItem('appPassword');
        
        if(!savedPass){
            alert('⚠️ ابتدا از بخش پروفایل رمز عبور تنظیم کنید!');
            return;
        }
        if(pass !== savedPass){
            alert('❌ رمز عبور اشتباه است!');
            return;
        }
        
        let accounts = JSON.parse(localStorage.getItem('accounts')||'[]');
        accounts = accounts.filter(acc => acc.id !== deleteTargetId);
        localStorage.setItem('accounts', JSON.stringify(accounts));
        alert('✅ تراکنش حذف شد!');
        deleteModal.style.display='none';
        deleteForm.reset();
        loadAccounts();
        loadReports(monthFilter.value);
    });

    // نمایش حساب‌ها با دکمه حذف
    function loadAccounts() {
        const accounts = JSON.parse(localStorage.getItem('accounts')||'[]');
        accountList.innerHTML = '';
        if(accounts.length === 0)
            return accountList.innerHTML = '<li style="text-align:center; color:#9ca3af;">هیچ تراکنشی ثبت نشده</li>';
        const fragment = document.createDocumentFragment();
        accounts.slice(-10).reverse().forEach(acc => {
            const typeLabel = acc.type==='deposit'?'💰 واریز':'💸 برداشت';
            const color = acc.type==='deposit'?'#10b981':'#ef4444';
            const li = document.createElement('li');
            li.innerHTML = `<div><strong>${acc.title}</strong>
                <small style="color:#888;">${typeLabel} | ${acc.owner} | ${acc.date}</small></div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="color:${color};font-weight:700;">${acc.amount.toLocaleString()} تومان</span>
                    <button class="delete-btn" data-id="${acc.id}">🗑️ حذف</button>
                </div>`;
            fragment.appendChild(li);
        });
        accountList.appendChild(fragment);
        
        // رویداد حذف
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function(){
                deleteTargetId = parseInt(this.getAttribute('data-id'));
                deleteModal.style.display='block';
            });
        });
    }

    // جدول گزارش
    function loadReports(filterType){
        const accounts = JSON.parse(localStorage.getItem('accounts')||'[]');
        reportTableBody.innerHTML = '';
        let filtered = accounts;
        if(filterType==='current'){
            const now = new Date();
            filtered = accounts.filter(acc=>{
                const d = new Date(acc.timestamp);
                return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
            });
        }
        if(filtered.length === 0){
            reportTableBody.innerHTML = `<tr><td colspan="6" style="padding:30px; color:#9ca3af;">داده‌ای برای نمایش نیست</td></tr>`;
        }else{
            const fragment = document.createDocumentFragment();
            filtered.slice().reverse().forEach((acc, i)=>{
                const color = acc.type==='deposit'?'#10b981':'#ef4444';
                const typeLabel = acc.type==='deposit'?'واریز':'برداشت';
                const row = document.createElement('tr');
                row.innerHTML = `<td>${i+1}</td>
                    <td>${acc.date}</td>
                    <td>${acc.time}</td>
                    <td>${acc.title} (${typeLabel})</td>
                    <td>${acc.owner}</td>
                    <td style="color:${color}; font-weight:700;">${acc.amount.toLocaleString()}</td>`;
                fragment.appendChild(row);
            });
            reportTableBody.appendChild(fragment);
        }
        calculateSummary(accounts, filtered);
    }

    // خلاصه مالی
    function calculateSummary(all, month){
        let tAll=0,tDep=0,tWit=0;
        all.forEach(acc=>{tAll+=acc.amount;});
        month.forEach(acc=>{if(acc.type==='deposit') tDep+=acc.amount; else tWit+=acc.amount;});
        document.getElementById('totalAll').textContent = tAll.toLocaleString()+" تومان";
        document.getElementById('totalDeposit').textContent = tDep.toLocaleString()+" تومان";
        document.getElementById('totalWithdraw').textContent = tWit.toLocaleString()+" تومان";
    }
});
