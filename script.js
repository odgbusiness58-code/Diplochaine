document.addEventListener('DOMContentLoaded', () => {
    const verifyButton = document.getElementById('verify-button');
    const scanButton = document.getElementById('scan-button');
    const verifyResult = document.getElementById('verify-result');
    const scanResult = document.getElementById('scan-result');

    // Vérification par numéro
    verifyButton.addEventListener('click', () => {
        const diplomaNumber = document.getElementById('diploma-number').value.trim();

        if (!diplomaNumber) {
            verifyResult.textContent = 'Veuillez saisir un numéro de diplôme.';
            verifyResult.style.color = '#dc2626';
            return;
        }

        const validFormat = /^DIPLO-\s*[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
        if (!validFormat.test(diplomaNumber)) {
            verifyResult.textContent = 'Format invalide. Utilisez DIPLO-550e8400-e29b-41d4-a716-446655440000.';
            verifyResult.style.color = '#dc2626';
            return;
        }

        // Simulation de vérification
        verifyResult.textContent = 'Vérification en cours...';
        verifyResult.style.color = '#2563eb';

        setTimeout(() => {
            const isValid = diplomaNumber.endsWith('1234') || diplomaNumber.endsWith('5678');
            if (isValid) {
                verifyResult.textContent = `✓ Diplôme ${diplomaNumber} vérifié avec succès !`;
                verifyResult.style.color = '#059669';
            } else {
                verifyResult.textContent = `⚠ Diplôme non reconnu, fraude potentielle.`;
                verifyResult.style.color = '#dc2626';
            }
        }, 1500);
    });

    // Scan QR Code (caméra réelle via html5-qrcode)
    const qrScannerBox = document.getElementById('qr-scanner');
    const diplomaFormat = /^DIPLO-\s*[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    let html5QrCode = null;
    let isScanning = false;

    const stopScanner = async () => {
        if (html5QrCode && isScanning) {
            try {
                await html5QrCode.stop();
                await html5QrCode.clear();
            } catch (e) { /* noop */ }
        }
        isScanning = false;
        qrScannerBox.classList.remove('scanning');
        scanButton.textContent = 'Scanner QR';
    };

    scanButton.addEventListener('click', async () => {
        if (isScanning) {
            await stopScanner();
            scanResult.textContent = 'Scan interrompu.';
            scanResult.style.color = '#6b7280';
            return;
        }

        if (typeof Html5Qrcode === 'undefined') {
            scanResult.textContent = 'Bibliothèque de scan indisponible.';
            scanResult.style.color = '#dc2626';
            return;
        }

        scanResult.textContent = 'Activation de la caméra...';
        scanResult.style.color = '#2563eb';
        qrScannerBox.classList.add('scanning');
        scanButton.textContent = 'Arrêter';
        isScanning = true;

        html5QrCode = new Html5Qrcode('qr-reader');

        const onScanSuccess = async (decodedText) => {
            await stopScanner();
            const value = (decodedText || '').trim();

            if (!diplomaFormat.test(value)) {
                scanResult.textContent = `⚠ QR scanné mais format non reconnu : ${value}`;
                scanResult.style.color = '#dc2626';
                return;
            }

            scanResult.textContent = 'Vérification en cours...';
            scanResult.style.color = '#2563eb';
            setTimeout(() => {
                const isValid = value.endsWith('1234') || value.endsWith('5678');
                if (isValid) {
                    scanResult.textContent = ` QR Code scanné : diplôme ${value} validé !`;
                    scanResult.style.color = '#059669';
                } else {
                    scanResult.textContent = ` Diplôme ${value} non reconnu, fraude potentielle.`;
                    scanResult.style.color = '#dc2626';
                }
            }, 1000);
        };

        try {
            await html5QrCode.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 200, height: 200 } },
                onScanSuccess,
                () => { /* ignorer les erreurs de frame */ }
            );
        } catch (err) {
            await stopScanner();
            scanResult.textContent = 'Impossible d\'accéder à la caméra. Vérifiez les autorisations.';
            scanResult.style.color = '#dc2626';
        }
    });

    // Navigation mobile
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');

    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', () => {
            navbarMenu.classList.toggle('active');
            navbarToggle.classList.toggle('active');
        });
    }

    // Smooth scrolling pour les liens de navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Fermer le menu mobile après clic
                navbarMenu.classList.remove('active');
                navbarToggle.classList.remove('active');
            }
        });
    });

    // Animation au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observer tous les éléments à animer
    document.querySelectorAll('.section, .feature-card, .gallery-item, .demo-card').forEach(el => {
        observer.observe(el);
    });
});


