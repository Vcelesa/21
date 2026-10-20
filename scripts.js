document.addEventListener('DOMContentLoaded', () => {
    // 1. Lấy các phần tử DOM
    const loadingScreen = document.getElementById('loadingScreen');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const submitBtn = document.getElementById('submitName');
    const nameInput = document.getElementById('nameInput');
    const modal = document.getElementById('popupModal');
    const closeBtn = document.getElementById('closeBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const displayName = document.getElementById('displayName');
    const suggestList = document.getElementById("suggest");
    const cardImage = document.getElementById("cardImage");
    const wishText = document.getElementById("wishText");

    const TOTAL_IMAGES = 30;
    // Tổng số tài nguyên cần theo dõi = 28 ảnh + 1 file json + 1 file txt = 30
    const TOTAL_RESOURCES = TOTAL_IMAGES + 2; 
    let loadedCount = 0;

    let studentData = [];
    let wishesList = [];
    const preloadedImages = [];

    // Cập nhật thanh tiến trình %
    function updateProgress() {
        loadedCount++;
        const percent = Math.min(Math.round((loadedCount / TOTAL_RESOURCES) * 100), 100);
        
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${percent}%`;

        // Khi đã tải xong 100% tài nguyên
        if (loadedCount >= TOTAL_RESOURCES) {
            setTimeout(() => {
                if (loadingScreen) loadingScreen.classList.add('hidden');
            }, 300); // Đợi 0.3s cho mượt mắt
        }
    }

    // ==========================================
    // 2. TẢI TRƯỚC (PRELOAD) 24 ẢNH
    // ==========================================
    function preloadAllImages() {
        for (let i = 1; i <= TOTAL_IMAGES; i++) {
            const img = new Image();
            img.src = `asset/pic/${i}.jpg`;
            
            // Đếm tiến trình kể cả khi ảnh tải thành công hoặc bị lỗi
            img.onload = updateProgress;
            img.onerror = updateProgress;

            preloadedImages.push(img);
        }
    }
    preloadAllImages();

    // ==========================================
    // 3. TẢI FILE CHUC.TXT VÀ DATA.JSON
    // ==========================================
    fetch('asset/chuc.txt')
        .then(response => response.text())
        .then(data => {
            wishesList = data.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
            updateProgress();
        })
        .catch(error => {
            console.error('Không thể tải file lời chúc:', error);
            wishesList = [
                "Chúc bạn luôn xinh đẹp, rạng rỡ, tràn ngập hạnh phúc và đạt được nhiều thành công! Cảm ơn bạn vì đã luôn là một phần tuyệt vời của gia đình CVC! 🌸✨"
            ];
            updateProgress();
        });

    fetch("data.json")
        .then((response) => response.json())
        .then((data) => {
            studentData = data;
            updateProgress();
        })
        .catch((error) => {
            console.error("Lỗi khi tải dữ liệu:", error);
            updateProgress();
        });

    // ==========================================
    // 4. CÁC HÀM XỬ LÝ GIAO DIỆN KHÁC
    // ==========================================
    function removeAccents(str) {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    }

    // Lấy thẻ hiển thị lỗi
const errorMessage = document.getElementById("errorMessage");

// Hàm hiển thị lỗi
function showError(msg) {
    if (errorMessage) {
        errorMessage.textContent = msg;
        errorMessage.style.display = "block";
    }
    nameInput.focus();
}

// Hàm ẩn lỗi
function clearError() {
    if (errorMessage) {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
    }
}

    function getRandomWish() {
        if (wishesList.length === 0) {
            return "Chúc bạn ngày 20/10 tràn ngập niềm vui và hạnh phúc! 🌸✨";
        }
        const randomIndex = Math.floor(Math.random() * wishesList.length);
        return wishesList[randomIndex];
    }

    function getRandomImage() {
        const randomIndex = Math.floor(Math.random() * preloadedImages.length);
        return preloadedImages[randomIndex].src;
    }

    // Gợi ý tên
    nameInput.addEventListener("input", () => {
        clearError();
        const query = removeAccents(nameInput.value.trim().toLowerCase());
        suggestList.innerHTML = "";

        if (query === "") {
            suggestList.style.display = "none";
            return;
        }

        const matches = studentData.filter((item) =>
            removeAccents(item.name.toLowerCase()).includes(query)
        );

        if (matches.length === 0) {
            suggestList.style.display = "none";
            return;
        }

        matches.forEach((item, index) => {
            const li = document.createElement("li");
            li.setAttribute("data-index", index);
            li.innerHTML = `
                <span class="s-name">${item.name}</span>
                <span class="s-meta">${item.meta}</span>
            `;

            li.addEventListener("click", () => {
                nameInput.value = item.name;
                suggestList.style.display = "none";
            });

            suggestList.appendChild(li);
        });

        suggestList.style.display = "block";
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".getname")) {
            suggestList.style.display = "none";
        }
    });

    // Hàm mở Modal
    function openModal() {
        
        const nameValue = nameInput.value.trim();
        
        clearError();

        if (nameValue === "") {
            showError("⚠️ Vui lòng nhập tên của bạn!");
            return;
        } else {
            displayName.textContent = nameValue;
        }

        if (cardImage) cardImage.src = getRandomImage();
        if (wishText) wishText.textContent = getRandomWish();
        if (suggestList) suggestList.style.display = "none";

        modal.style.display = "flex";
        modal.classList.add('show');
    }

    // Hàm đóng Modal
    function closeModal() {
        modal.style.display = "none";
        modal.classList.remove('show');
    }

    // Sự kiện
    if (submitBtn) submitBtn.addEventListener('click', openModal);

    if (nameInput) {
        nameInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                openModal();
            }
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
});
