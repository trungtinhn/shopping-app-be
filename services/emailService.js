const nodemailer = require('nodemailer');

// Cấu hình transporter (sử dụng Gmail làm ví dụ)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn
    pass: process.env.EMAIL_PASS, // App password hoặc password
  },
});

// Hàm gửi email thông báo duyệt cửa hàng
const sendStoreApprovalEmail = async (storeData) => {
  try {
    const mailOptions = {
      from: {
        name: 'Hệ thống Quản lý Cửa hàng',
        address: process.env.EMAIL_USER
      },
      to: storeData.email,
      subject: '🎉 Tài khoản cửa hàng của bạn đã được kích hoạt thành công!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thông báo kích hoạt tài khoản</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .success-badge {
              background-color: #27ae60;
              color: white;
              padding: 10px 20px;
              border-radius: 25px;
              display: inline-block;
              margin: 20px 0;
            }
            .store-info {
              background-color: #ecf0f1;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #7f8c8d;
            }
            .btn {
              display: inline-block;
              padding: 12px 30px;
              background-color: #3498db;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Chúc mừng!</h1>
              <div class="success-badge">
                Tài khoản đã được kích hoạt
              </div>
            </div>
            
            <div class="content">
              <p>Xin chào <strong>${storeData.storeName}</strong>,</p>
              
              <p>Chúng tôi vui mừng thông báo rằng tài khoản cửa hàng của bạn đã được <strong>duyệt và kích hoạt thành công</strong>!</p>
              
              <div class="store-info">
                <h3>Thông tin cửa hàng:</h3>
                <p><strong>Tên cửa hàng:</strong> ${storeData.storeName}</p>
                <p><strong>Email:</strong> ${storeData.email}</p>
                <p><strong>Trạng thái:</strong> <span style="color: #27ae60; font-weight: bold;">Đã kích hoạt</span></p>
                <p><strong>Ngày kích hoạt:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
              </div>
              
              <p>Bây giờ bạn có thể:</p>
              <ul>
                <li>Đăng nhập vào hệ thống quản lý cửa hàng</li>
                <li>Thêm và quản lý sản phẩm</li>
                <li>Xử lý đơn hàng từ khách hàng</li>
                <li>Sử dụng dịch vụ giao hàng GHN</li>
              </ul>
              
              <div style="text-align: center;">
                  Đăng nhập ngay
                </a>
              </div>
              
              <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email này hoặc hotline hỗ trợ.</p>
              
              <p>Chúc bạn kinh doanh thành công!</p>
            </div>
            
            <div class="footer">
              <p>Trân trọng,<br>
              <strong>Đội ngũ hỗ trợ</strong></p>
              <p style="font-size: 12px; color: #95a5a6;">
                Email này được gửi tự động, vui lòng không trả lời trực tiếp.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Text version cho email client không hỗ trợ HTML
      text: `
        Chúc mừng ${storeData.storeName}!
        
        Tài khoản cửa hàng của bạn đã được duyệt và kích hoạt thành công!
        
        Thông tin cửa hàng:
        - Tên cửa hàng: ${storeData.storeName}
        - Email: ${storeData.email}
        - Trạng thái: Đã kích hoạt
        - Ngày kích hoạt: ${new Date().toLocaleDateString('vi-VN')}
        
        Bây giờ bạn có thể đăng nhập và bắt đầu sử dụng hệ thống.
        
        Nếu có câu hỏi, vui lòng liên hệ với chúng tôi.
        
        Trân trọng,
        Đội ngũ hỗ trợ
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendStoreApprovalEmail
};