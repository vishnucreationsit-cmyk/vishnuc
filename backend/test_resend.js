const { Resend } = require('resend');

const resend = new Resend('re_igeYdDo1_7Qgg21qXUqAnQRMpuDvqxbwt');

async function testResend() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'vishnucreationsit@gmail.com',
      subject: 'Test Email',
      html: '<p>Test Email from Resend</p>'
    });

    if (error) {
      console.error('Resend error:', error);
    } else {
      console.log('Resend success:', data);
    }
  } catch (err) {
    console.error('Caught error:', err);
  }
}

testResend();
