$(document).ready(function() {
    // Verify
    $('[data-button="verify"]').on('click', function() {
        const hash = window.location.href.split('/verify/')[1].substring(0, 256);
        swal.fire({
            title: 'กรุณารอสักครู่',
            text: 'กำลังบันทึกข้อมูล...',
            icon: 'info',
            showCloseButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false
        });
        Swal.showLoading();
        $('[data-button="verify"]').attr('disabled', 'true');
        grecaptcha.ready(function() {
            grecaptcha.execute(recaptcha_sitekey, {action: 'verify'}).then(function(token) {
                request('verify', [
                    {name: 'token', value: token},
                    {name: 'hash', value: hash.trim()}
                ], function(status, res) {
                    if(status == 200) {
                        $('[data-button="verify"]').remove();
                        return swal.fire('ดำเนินการสำเร็จ', res.message, 'success')
                    } else {
                        $('[data-button="verify"]').removeAttr('disabled');
                        return swal.fire('เกิดข้อผิดพลาด', res.message, 'danger')
                    }
                });
            });
        });
    })
});