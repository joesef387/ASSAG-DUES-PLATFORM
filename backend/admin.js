async function loadDues() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/dues");
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const records = await response.json();
        const tableBody = document.getElementById("duesTableBody");
        tableBody.innerHTML = "";

        let totalDues = 0;
        let paidStudents = 0;
        let pendingStudents = 0;

        records.forEach(function(record) {
            totalDues += Number(record.amount) || 0;

            if (record.status === "Paid") {
                paidStudents++;
            } else {
                pendingStudents++;
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${record.full_name}</td>
                <td>${record.student_id}</td>
                <td>${record.level}</td>
                <td>${record.membership}</td>
                <td>${record.semester}</td>
                <td>GH₵${record.amount}</td>
                <td>${record.status}</td>
            `;

            tableBody.appendChild(row);
        });

        document.getElementById("totalStudents").textContent = records.length;
        document.getElementById("totalDues").textContent = "GH₵" + totalDues;
        document.getElementById("paidStudents").textContent = paidStudents;
        document.getElementById("pendingStudents").textContent = pendingStudents;

    } catch (error) {
        console.error(error);
    }
}

loadDues();
