$(document).ready(function() {
    // Update data
    update_date();
    let loop = setInterval(() => {
        update_date();
    }, 5000)
    
    preload(Object.keys(dragon).map((key) => dragon[key]))

	function preload(arrayOfImages) {
		$(arrayOfImages).each(function () {
			$('<img data-image="preload" />').attr('src', this).appendTo('body').css('display', 'none');
		});
	}

    function update_date() {
        $.get({
            url: './data/stats.json',
            data: [],
            processData: false,
            contentType: false,
            cache : false
        }).done((res) => {
            const total = parseInt(res.adult) + parseInt(res.child);
            let percent = Math.ceil((100 * total) / max);
            let image = dragon['0'];
            percent = percent > 100 ? 100 : percent;
            $('[data-text="adult"]').html(numberWithCommas(res.adult));
            $('[data-text="child"]').html(numberWithCommas(res.child));
            $('[data-text="total"]').html(numberWithCommas(total));
            $('[data-progressbar="total"]').html(percent + '%').css('width', percent + '%');
            if(percent < 25) {
                image = dragon['0'];
            } else if(percent < 50) {
                image = dragon['25'];
            } else if(percent < 75) {
                image = dragon['50'];
            } else if(percent < 100) {
                image = dragon['75'];
            } else {
                image = dragon['100'];
            }
            $('[data-images="dragon"]').attr('src', image);
        })
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || x;
    }
    
    // Register
    const form = {
        location: $('form[data-form="register"] input[name="location"]'),
        prefix: $('form[data-form="register"] input[name="prefix"]'),
        first_name: $('form[data-form="register"] input[name="first_name"]'),
        last_name: $('form[data-form="register"] input[name="last_name"]'),
        id: $('form[data-form="register"] input[name="id"]'),
        birthday: $('form[data-form="register"] input[name="birthday"]'),
        province: $('form[data-form="register"] select[name="province"]'),
        email: $('form[data-form="register"] input[name="email"]'),
        telephone: $('form[data-form="register"] input[name="telephone"]'),
        agree: $('form[data-form="register"] input[name="agree"]'),
        signature: $('form[data-form="register"] [data-div="signature"]')
    };
       
    let validator = {
        location: false,
        prefix: false,
        first_name: false,
        last_name: false,
        id: false,
        birthday: false,
        province: false,
        email: false,
        telephone: false,
        agree: false,
        signature: false
    }
    
    $('form[data-form="register"]').on('submit', (e) => {
        e.preventDefault();
        let invalid = 0;
        for (const key in validator) {
            if(validator[key] == false) {
                invalid++;
                if(key == 'province') {
                    form.province.selectpicker('setStyle', 'is-invalid', 'add').selectpicker('setStyle', 'is-valid', 'remove');
                } else {
                    form[key].addClass('is-invalid').removeClass('is-valid');
                }
            }
        }
        if(invalid !== 0) {
            return;
        }
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
        $('form[data-form="register"] input').attr('readonly', true);
        $('form[data-form="register"] button[type="submit"]').attr('disabled', 'true');
        grecaptcha.ready(function() {
            grecaptcha.execute(recaptcha_sitekey, {action: 'register'}).then(function(token) {
                request('register', [
                    {name: 'token', value: token},
                    {name: 'location', value: form.location.val().trim()},
                    {name: 'prefix', value: form.prefix.val().trim()},
                    {name: 'first_name', value: form.first_name.val().trim()},
                    {name: 'last_name', value: form.last_name.val().trim()},
                    {name: 'id', value: form.id.val().trim()},
                    {name: 'birthday', value: form.birthday.val().trim()},
                    {name: 'province', value: form.province.val().trim()},
                    {name: 'email', value: form.email.val().trim()},
                    {name: 'telephone', value: form.telephone.val().trim()},
                    {name: 'agree', value: form.agree.val().trim()},
                    {name: 'signature', value: form.signature.jSignature('getData').toString()}
                ], function(status, res) {
                    $('form[data-form="register"] input').removeAttr('readonly');
                    $('form[data-form="register"] button[type="submit"]').removeAttr('disabled');
                    if(status == 200) {
                        form.location.val('');
                        form.prefix.val('');
                        form.first_name.val('');
                        form.last_name.val('');
                        form.id.val('');
                        form.birthday.datetimepicker('clear')
                        form.province.val('').selectpicker('refresh');
                        form.email.val('');
                        form.telephone.val('');
                        form.agree.prop('checked', false );
                        form.signature.jSignature('reset');
                        $('form[data-form="register"] + .is-invalid, .is-valid').removeClass('is-invalid is-valid');
                        for (const key in validator) {
                            validator[key] = false;
                        }
                        return swal.fire('ดำเนินการสำเร็จ', 'เข้าชื่อเสนอพ.ร.บ. ว่าด้วยสิทธิมนุษยชนของผู้เรียน เรียบร้อยแล้ว', 'success')
                    } else {
                        return swal.fire('เกิดข้อผิดพลาด', res.message, 'error')
                    }
                });
            });
        });
    })
    
    const registerModal = document.querySelector('#registerModal');
    registerModal.addEventListener('shown.bs.modal', function(event) {
        validator['signature'] = false;
        form.signature.jSignature({
            color: '#000',
            width: '100%',
            height: '100%',
            'background-color': '#fff'
        });
    })
    
    registerModal.addEventListener('hidden.bs.modal', function(event) {
        validator['signature'] = false;
        return form.signature.empty();
    })
    
    $('[data-button="signature-reset"]').on('click', function() {
        validator['signature'] = false;
        return form.signature.jSignature('reset');
    })
    
    // Datepicker
    form.birthday.datetimepicker({
        inline: true,
        sideBySide: true,
        locale: 'th',
        format: 'YYYY-MM-DD',
        maxDate: moment(),
        defaultDate: moment().subtract(18, 'years')
    });

    // Autocomplete
    $.ajax(
        './data/province.json', {}
    ).done(function (res) {
        res.forEach(p => {
            form.province.append('<option value="' + p.id + '">' + p.name + '</option>');
        });
        
        form.province.selectpicker('refresh');
        
        form.location.easyAutocomplete({
            data: res,
            getValue: "name",
            list: {
                match: {
                    enabled: true
                }
            }
        });
    });
    
    form.prefix.easyAutocomplete({
        data: [
            'นาย',
            'นาง',
            'นางสาว',
            'เด็กชาย',
            'เด็กหญิง'
        ],
        list: {
            match: {
                enabled: true
            }
        }
    });
    
    // Validator
    form.location.bind('input', function(e) {
        return cant_empty('location');
    });
    
    form.prefix.bind('input', function(e) {
        return cant_empty('prefix', /^[\u0E00-\u0E7F,\s,(,),.]{1,150}$/);
    });
    
    form.first_name.bind('input', function(e) {
        return cant_empty('first_name');
    });
    
    form.last_name.bind('input', function(e) {
        return cant_empty('last_name');
    });
    
    form.id.bind('input', function(e) {
        if(!/^\d+$/.test(form.id.val())) {
            return form.id.val(form.id.val().replace(/[^\d]/g, ''));
        }
        if(form.id.val().length == 13) {
            if(check_id(form.id.val())) {
                validator['id'] = true;
                return form.id.addClass('is-valid').removeClass('is-invalid');
            }
            validator['id'] = false;
            return form.id.addClass('is-invalid').removeClass('is-valid');
        } else {
            validator['id'] = false;
            return form.id.removeClass('is-valid is-invalid');
        }
    });
    
    form.birthday.bind('input', function(e) {
        if(moment(form.birthday.val()).isValid() && moment(form.birthday.val()) < moment()) {
            validator['birthday'] = true;
            return form.birthday.addClass('is-valid').removeClass('is-invalid');
        }
        validator['birthday'] = false;
        return form.birthday.addClass('is-invalid').removeClass('is-valid');
    });
    
    form.province.bind('change', function(e) {
        if(form.province.val() < 1 || form.province.val() > 77) {
            validator['province'] = false;
            return form.province.selectpicker('setStyle', 'is-invalid', 'add').selectpicker('setStyle', 'is-valid', 'remove');
        }
        validator['province'] = true;
        return form.province.selectpicker('setStyle', 'is-valid', 'add').selectpicker('setStyle', 'is-invalid', 'remove');
    });
    
    form.email.bind('input', function(e) {
        if(form.email.val().includes('@') && form.email.val().includes('.') && form.email.val().split('.').slice(-1)[0].length >= 2) {
            if(check_email(form.email.val())) {
                validator['email'] = true;
                return form.email.addClass('is-valid').removeClass('is-invalid');
            }
            validator['email'] = false;
            return form.email.addClass('is-invalid').removeClass('is-valid');
        } else {
            validator['email'] = false;
            return form.email.removeClass('is-valid is-invalid');
        }
    });
    
    form.telephone.bind('input', function(e) {
        if(!/^\d+$/.test(form.telephone.val())) {
            return form.telephone.val(form.telephone.val().replace(/[^\d]/g, ''));
        }
        if(form.telephone.val().length === 10) {
            if(check_phone(form.telephone.val())) {
                validator['telephone'] = true;
                return form.telephone.addClass('is-valid').removeClass('is-invalid');
            }
            validator['telephone'] = false;
            return form.telephone.addClass('is-invalid').removeClass('is-valid');
        } else {
            validator['telephone'] = false;
            return form.telephone.removeClass('is-valid is-invalid');
        }
    });
    
    form.signature.bind('change', function(e) {
        if(form.signature.jSignature('getData', 'native').length === 0) {
            validator['signature'] = false;
            form.signature.addClass('is-invalid').removeClass('is-valid');
        } else {
            validator['signature'] = true;
            form.signature.addClass('is-valid').removeClass('is-invalid');
        }
    })
    
    form.agree.bind('change', function(e) {
        if(form.agree.is(":checked")) {
            validator['agree'] = true;
            return form.agree.addClass('is-valid').removeClass('is-invalid');
        } else {
            validator['agree'] = false;
            return form.agree.addClass('is-invalid').removeClass('is-valid');
        }
    });
    
    function check_id(id) {
        if (!id || id.length !== 13 || !/^[0-9]\d+$/.test(id)) {
            return false;
        }
        let i, sum = 0;
        for ((i = 0), (sum = 0); i < 12; i++) {
            sum += parseInt(id.charAt(i)) * (13 - i);
        }
        let check = (11 - sum % 11) % 10;
        if (check === parseInt(id.charAt(12))) {
            return true;
        }
        return false;
    }
    
    function check_email(email) {
        if (!email || email.length < 5 || email.length > 320) {
            return false;
        }
        if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEFa-zA-Z\-0-9]+\.)+[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEFa-zA-Z]{2,}))$/.test(email)) {
            return false;
        }
        return true;
    }
    
    function check_phone(phone) {
        if (!phone || phone.length !== 10) {
            return false;
        }
        if (!/^0[6,8,9]{1}[0-9]{8}$/i.test(phone)) {
            return false;
        }
        return true;
    }
    
    function cant_empty(element_name = null, regex = /^[\u0E00-\u0E7F,\s]{1,150}$/) {
        if(!element_name || !form[element_name]) {
            return;
        }
        let element = form[element_name];
        if(element.val().trim().length >= 1  && regex.test(element.val().trim())) {
            validator[element_name] = true;
            return element.addClass('is-valid').removeClass('is-invalid');
        }
        validator[element_name] = false;
        return element.removeClass('is-valid').addClass('is-invalid');
    }

    // Swiper
    new Swiper('[data-swiper="main"]', {
        slidesPerView: 1.1,
        spaceBetween: 15,
        centeredSlides: false,
        grabCursor: true,
        freeMode: true,
        slidesOffsetAfter: 15,
        slidesOffsetBefore: 15,
        breakpoints: {
            // when window width is >= 320px
            480: {
                slidesPerView: 2,
                spaceBetween: 30,
                slidesOffsetAfter: 15,
                slidesOffsetBefore: 15,
            },
            // when window width is >= 480px
            640: {
                slidesPerView: 2,
                spaceBetween: 30,
                slidesOffsetAfter: 15,
                slidesOffsetBefore: 15,
            },
            // when window width is >= 640px
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
                slidesOffsetAfter: 30,
                slidesOffsetBefore: 30,
            },
            1280: {
                slidesPerView: 4.5,
                spaceBetween: 30,
                slidesOffsetAfter: 30,
                slidesOffsetBefore: 300,
            },
        }
    });
    
    new Swiper('[data-swiper="partner"]', {
            spaceBetween: 30,
            centeredSlides: true,
            autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigstion: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
      });
});
