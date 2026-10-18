const duesForm = document.getElementById("duesForm");
const continueButton = document.getElementById("continueButton");
const paymentSummary = document.getElementById("paymentSummary");
const paymentPage = document.getElementById("paymentPage");
const proceedButton = document.getElementById("proceedButton");
const backButton = document.getElementById("backButton");
const paymentBackButton = document.getElementById("paymentBackButton");
const payButton = document.getElementById("payButton");
const membership = document.getElementById("membership");
const amount = document.getElementById("amount");

// Prevent the form from reloading the page
duesForm.addEventListener("submit", function (event) {
    event.preventDefault();
});

// ==========================================
// PAYMENT VARIABLES
// ==========================================

let amountValue = 0;
let paymentReference = "";


// ==========================================
// STUDENT DATA
// ==========================================

let studentData = {
    fullName: "",
    studentId: "",
    email: "",
    level: "",
    membership: "",
    semester: ""
};


function showStudentForm() {

    duesForm.style.display = "block";

    paymentSummary.style.display = "none";

    paymentPage.style.display = "none";
}


// ==========================================
// SHOW PAYMENT SUMMARY
// ==========================================

function showPaymentSummary() {

    duesForm.style.display = "none";

    paymentSummary.style.display = "block";

    paymentPage.style.display = "none";
}


// ==========================================
// SHOW MAKE PAYMENT PAGE
// ==========================================

function showPaymentPage() {

    duesForm.style.display = "none";

    paymentSummary.style.display = "none";

    paymentPage.style.display = "block";
}


// ==========================================
// PAGE LOAD
// ==========================================

showStudentForm();


// ==========================================
// MEMBERSHIP AMOUNT
// ==========================================

membership.addEventListener("change", function () {

    if (membership.value === "general") {

        amountValue = 25;

        amount.value = "GH₵25";
    }

    else if (membership.value === "cc") {

        amountValue = 20;

        amount.value = "GH₵20";
    }

    else {

        amountValue = 0;

        amount.value = "GH₵0";
    }

});


// ==========================================
// STUDENT INFORMATION
// → PAYMENT SUMMARY
// ==========================================

continueButton.addEventListener("click", function () {

    // --------------------------------------
    // GET FORM VALUES
    // --------------------------------------

    const fullName =
        document.getElementById("fullName").value.trim();

    const studentId =
        document.getElementById("studentId").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const level =
        document.getElementById("level").value;

    const membershipType =
        document.getElementById("membership").value;

    const semester =
        document.getElementById("semester").value;


    // --------------------------------------
    // VALIDATION
    // --------------------------------------

    if (fullName === "") {

        alert("Please enter your full name.");

        return;
    }


    if (studentId === "") {

        alert("Please enter your student ID.");

        return;
    }


    if (email === "") {

        alert("Please enter your email.");

        return;
    }


    if (level === "") {

        alert("Please select your level.");

        return;
    }


    if (membershipType === "") {

        alert("Please select your membership type.");

        return;
    }


    if (semester === "") {

        alert("Please select your semester.");

        return;
    }


    // --------------------------------------
    // SET AMOUNT
    // --------------------------------------

    if (membershipType === "general") {

        amountValue = 25;

    }

    else if (membershipType === "cc") {

        amountValue = 20;

    }

    else {

        alert("Please select a valid membership type.");

        return;
    }


    // --------------------------------------
    // SAVE STUDENT INFORMATION
    // --------------------------------------

    studentData.fullName = fullName;

    studentData.studentId = studentId;

    studentData.email = email;

    studentData.level = level;

    studentData.membership = membershipType;

    studentData.semester = semester;


    // --------------------------------------
    // UPDATE PAYMENT SUMMARY
    // --------------------------------------

    document.getElementById(
        "summaryName"
    ).textContent = fullName;


    document.getElementById(
        "summaryStudentId"
    ).textContent = studentId;


    document.getElementById(
        "summaryLevel"
    ).textContent = level;


    document.getElementById(
        "summaryMembership"
    ).textContent =
        membershipType === "general"
            ? "General Member"
            : "CC Member";


    document.getElementById(
        "summarySemester"
    ).textContent =
        semester === "first"
            ? "First Semester"
            : "Second Semester";


    document.getElementById(
        "summaryAmount"
    ).textContent =
        "GH₵" + amountValue;


    // --------------------------------------
    // SHOW PAYMENT SUMMARY
    // --------------------------------------

    showPaymentSummary();

});


// ==========================================
// PAYMENT SUMMARY
// → STUDENT INFORMATION
// ==========================================

backButton.addEventListener("click", function () {

    showStudentForm();

});


// ==========================================
// PAYMENT SUMMARY
// → MAKE PAYMENT
// ==========================================

proceedButton.addEventListener("click", async function () {

    proceedButton.disabled = true;

    proceedButton.textContent = "Processing...";


    try {

        // ----------------------------------
        // SEND DATA TO FLASK
        // ----------------------------------

        const response = await fetch(
            "http://127.0.0.1:5000/api/dues",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    fullName: studentData.fullName,

                    studentId: studentData.studentId,

                    email: studentData.email,

                    level: studentData.level,

                    membership: studentData.membership,

                    semester: studentData.semester,

                    amount: amountValue

                })
            }
        );


        // ----------------------------------
        // CHECK SERVER RESPONSE
        // ----------------------------------

        if (!response.ok) {

            throw new Error(
                "Server returned an error."
            );
        }


        const result =
            await response.json();


        console.log(
            "Server response:",
            result
        );


        // ----------------------------------
        // CHECK SUCCESS
        // ----------------------------------

        if (!result.success) {

            alert(
                result.message ||
                "Unable to save dues."
            );

            return;
        }


        // ----------------------------------
        // SAVE PAYMENT REFERENCE
        // ----------------------------------

        paymentReference =
            result.payment_reference ||
            result.paymentReference;

        if (!paymentReference) {

            alert(
                "Payment reference was not returned by the server."
            );

            console.error(
                "Server response did not contain payment_reference:",
                result
            );

            return;
        }


        // ----------------------------------
        // UPDATE MAKE PAYMENT PAGE
        // ----------------------------------

        document.getElementById(
            "paymentAmount"
        ).textContent =
            "GH₵" + amountValue;


        document.getElementById(
            "paymentReference"
        ).textContent =
            paymentReference;


        // ----------------------------------
        // SHOW MAKE PAYMENT
        // ----------------------------------

        showPaymentPage();


        console.log(
            "Make Payment page displayed."
        );

    }

    catch (error) {

        console.error(
            "Error:",
            error
        );

        alert(
            "Unable to connect to the server. Please make sure the Flask backend is running."
        );

    }

    finally {

        proceedButton.disabled = false;

        proceedButton.textContent =
            "Proceed to Payment";

    }

});


// ==========================================
// MAKE PAYMENT
// → PAYMENT SUMMARY
// ==========================================

paymentBackButton.addEventListener(
    "click",
    function () {

        showPaymentSummary();

    }
);


// ==========================================
// PAY NOW
// → PAYSTACK
// ==========================================

payButton.addEventListener(
    "click",
    async function () {

        const email =
            studentData.email;


        // ----------------------------------
        // CHECK PAYMENT REFERENCE
        // ----------------------------------

        if (!paymentReference) {

            alert(
                "Payment reference is missing. Please go back and try again."
            );

            return;
        }


        // ----------------------------------
        // DISABLE BUTTON
        // ----------------------------------

        payButton.disabled = true;

        payButton.textContent =
            "Connecting to Paystack...";


        try {

            // --------------------------------
            // INITIALIZE PAYSTACK PAYMENT
            // --------------------------------

            const response = await fetch(
                "http://127.0.0.1:5000/api/payment/initialize",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        email: email,

                        amount: amountValue,

                        reference: paymentReference

                    })
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Payment server returned an error."
                );
            }


            const result =
                await response.json();


            console.log(
                "Paystack response:",
                result
            );


            // --------------------------------
            // REDIRECT TO PAYSTACK
            // --------------------------------

            if (result.success) {

                window.location.href =
                    result.authorization_url;

            }

            else {

                alert(
                    result.message ||
                    "Payment initialization failed."
                );

                payButton.disabled = false;

                payButton.textContent =
                    "Pay Now";
            }

        }

        catch (error) {

            console.error(
                "Paystack error:",
                error
            );

            alert(
                "Unable to connect to Paystack."
            );

            payButton.disabled = false;

            payButton.textContent =
                "Pay Now";
        }

    }
);