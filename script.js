document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pothole-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = form.querySelector('.btn-text');
    const spinner = document.getElementById('spinner');
    
    const resultsContainer = document.getElementById('results-container');
    const severityBadge = document.getElementById('severity-badge');
    const costValue = document.getElementById('cost-value');
    const risksList = document.getElementById('risks-list');
    const letterContent = document.getElementById('letter-content');
    const copyBtn = document.getElementById('copy-btn');
    const geoBtn = document.getElementById('geo-btn');
    const locationInput = document.getElementById('location');

    geoBtn.addEventListener('click', () => {
        if ("geolocation" in navigator) {
            geoBtn.textContent = '⏳';
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await res.json();
                    locationInput.value = data.display_name || `${lat}, ${lon}`;
                } catch (e) {
                    locationInput.value = `Lat: ${lat}, Lon: ${lon}`;
                }
                geoBtn.textContent = '📍';
            }, (error) => {
                alert("Could not get location. Please allow location access.");
                geoBtn.textContent = '📍';
            });
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI Loading State
        submitBtn.disabled = true;
        btnText.textContent = 'Analyzing...';
        spinner.style.display = 'block';
        resultsContainer.classList.add('hidden');

        // Gather Data
        let imageBase64 = null;
        const photoInput = document.getElementById('photo');
        if (photoInput.files && photoInput.files[0]) {
            const file = photoInput.files[0];
            const reader = new FileReader();
            imageBase64 = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }

        const formData = {
            location: document.getElementById('location').value,
            roadType: document.getElementById('roadType').value,
            size: document.getElementById('size').value,
            depth: document.getElementById('depth').value,
            description: document.getElementById('description').value,
            image_base64: imageBase64
        };

        try {
            // Send to Backend
            const response = await fetch('http://127.0.0.1:5000/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze');
            }

            const data = await response.json();

            // Populate Results
            populateResults(data);

            // Show Results
            resultsContainer.classList.remove('hidden');
            // Smooth scroll to results
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error('Error:', error);
            alert(`Analysis Failed: ${error.message}`);
        } finally {
            // Reset UI
            submitBtn.disabled = false;
            btnText.textContent = 'Analyze with AI';
            spinner.style.display = 'none';
        }
    });

    function populateResults(data) {
        // Set Severity
        const sev = data.severity || 'Unknown';
        severityBadge.textContent = sev;
        severityBadge.className = 'severity-badge'; // reset
        
        let sevClass = '';
        if (sev.toLowerCase().includes('critical')) sevClass = 'sev-critical';
        else if (sev.toLowerCase().includes('high')) sevClass = 'sev-high';
        else if (sev.toLowerCase().includes('medium')) sevClass = 'sev-medium';
        else if (sev.toLowerCase().includes('low')) sevClass = 'sev-low';
        
        if(sevClass) severityBadge.classList.add(sevClass);

        // Set Cost
        costValue.textContent = data.cost_estimate || 'Not estimated';

        // Set Risks
        risksList.innerHTML = '';
        if (data.safety_risks && Array.isArray(data.safety_risks)) {
            data.safety_risks.forEach(risk => {
                const li = document.createElement('li');
                li.textContent = risk;
                risksList.appendChild(li);
            });
        } else {
            risksList.innerHTML = '<li>No specific risks identified.</li>';
        }

        // Set Letter
        letterContent.textContent = data.complaint_letter || 'Letter could not be generated.';
    }

    // Copy to Clipboard Functionality
    copyBtn.addEventListener('click', () => {
        const textToCopy = letterContent.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = 'var(--sev-low)';
            copyBtn.style.borderColor = 'var(--sev-low)';
            copyBtn.style.color = '#fff';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
                copyBtn.style.borderColor = '';
                copyBtn.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy letter to clipboard.');
        });
    });
});
