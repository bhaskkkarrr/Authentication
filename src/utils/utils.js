export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateHtmlForOtp(otp) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<style>
  body {
    font-family: 'Times New Roman', Times, serif;
    background-color: #f4f4f4;
    padding: 20px;
    color: rgb(255, 255, 255);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .container {
    padding: 20px;
    background-color: #7c0000;
    border-radius: 20px;
    text-align: center;
  }

  .otp{
    font-weight: bold;
    font-size: 50px;
    color: #f4f4f4;
  }
</style>

<body>
  <div class="container">
    <p>Your OTP to verify your email</p>
    <span class="otp">${otp}</span>
  </div>
</body>

</html>`;
}
