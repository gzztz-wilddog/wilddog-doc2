// getClass('line').forEach(function(ele) {
//     ele.style.opacity = '0';
// })

$(function() {
    //右侧目录判断是否显示
    var airticleContent = document.querySelector('.article .inner');
    var toc = getClass('toc-content')[0];
    var platformsArr = [];
    var platformsLink = []
    if (getClass('toc-item').length < 1 && airticleContent) {
        airticleContent.removeChild(toc)
    }

    //  切换头部选中状态
    var type = window.location.pathname.split('/')[1]
        // var type = type.split('.')[0]
    var headerNavs = getClass('main-nav-link');
    if (type === 'overview') {
        addClass(headerNavs[0], 'current')
    } else if (type === 'sync') {
        addClass(headerNavs[1], 'current')
    } else if (type === 'video') {
        addClass(headerNavs[2], 'current')
    } else if (type === 'im') {
        addClass(headerNavs[3], 'current')
    } else if (type === 'sms') {
        addClass(headerNavs[4], 'current')
    } else if (type === 'auth') {
        addClass(headerNavs[5], 'current')
    }
    // 侧边栏收起
    var sidebarTitle = getClass('sidebar-title');
    sidebarTitle.forEach(function(ele) {
        ele.addEventListener('mouseup', function(event) {
            // event.stopPropagation();
            toggleClass(ele, 'select');
            if (getSiblings(ele)[0]) {
                toggleClass(getSiblings(ele)[0], 'current');
            }
            getSiblings(ele.parentElement).forEach(function(item, itemIndex) {
                [].slice.call(item.getElementsByClassName('sidebar-title')).forEach(function(title) {
                    removeClass(title, 'select')
                });
                [].slice.call(item.getElementsByClassName('sublist')).forEach(function(list) {
                    removeClass(list, 'current')
                })
            })
        })
    });

    //滚屏时右侧边栏根据当前标题高亮对应目录项
    var headings = getClass('article-heading');
    var tocLinks = getClass('toc-link');
    var tocLinksHref = [];
    var headingTops = [];
    var titleContent = document.getElementsByClassName('toc-link-title')[0];
    tocLinks.forEach(function(ele, index) {
        var id = ele.getAttribute('href').replace('#', '');
        ele.setAttribute('title', ele.textContent);
        tocLinksHref.push(id);
        ele.addEventListener('mouseenter', function(e) {
            var title = ele.getAttribute('title');
            titleContent.textContent = title;
            titleContent.style.display = 'block';
            titleContent.style.left = e.clientX + 'px';
            titleContent.style.top = e.clientY - 40 + 'px';
        });
        ele.addEventListener('mousemove', function(e) {
            titleContent.style.left = e.clientX + 'px';
            titleContent.style.top = e.clientY - 40 + 'px';
        });
        ele.addEventListener('mouseleave', function(e) {
            titleContent.style.display = 'none';
        })
    });
    headings.forEach(function(ele) {
        var actualTop = ele.offsetTop;
        var current = ele.offsetParent;
        while (current) {
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        actualTop -= 102;
        headingTops.push(actualTop);
    });
    var currentRangeStart = 0;
    var currentRangeEnd = headingTops[1];
    var currentIndex = 0;

    function getCurrentHeading(top) {
        for (var i = 0; i < headingTops.length; i++) {
            if (top >= headingTops[i] && top <= headingTops[i + 1]) {
                currentRangeStart = headingTops[i];
                currentRangeEnd = headingTops[i + 1];
                currentIndex = i;
                return headings[i]
            }
        }
    };

    function currentLinkSelect(heading) {
        var id = heading ? heading.id : tocLinksHref[0];
        var index = tocLinksHref.indexOf(id);
        if (index !== -1) {
            addClass(tocLinks[index], 'current');
        }
        tocLinks.forEach(function(ele, eleIndex) {
            if (eleIndex === index) return;
            removeClass(ele, 'current')
        })
    };

    var feedBack = getClass('feed-back')[0];
    var backTop = document.getElementsByClassName('back-top')[0];
    var scrollStart = 0;
    currentLinkSelect(headings[0]);

    function windowScrollHandle() {
        var scrollTop = window.scrollY;
        if (scrollTop >= window.innerHeight) {
            addClass(backTop, 'back-top-show')
        } else {
            removeClass(backTop, 'back-top-show')
        };
        if (scrollTop > scrollStart) {
            addClass(feedBack, 'scrollHide')
        } else {
            removeClass(feedBack, 'scrollHide')
        }
        scrollStart = scrollTop;

        if (scrollTop > currentRangeEnd || scrollTop < currentRangeStart) {
            var currentHeading = getCurrentHeading(scrollTop) || (scrollTop > headingTops[headingTops.length - 1] ? headings[headings.length - 1] : headings[0]);
            currentLinkSelect(currentHeading);
        } else {
            currentLinkSelect(getCurrentHeading(scrollTop))
        }
    };
    windowScrollHandle();
    window.addEventListener('scroll', windowScrollHandle);

    backTop.addEventListener('click', function() {
        window.scrollTo(0, 0);
    });

    $('.slide').each(function(index, el) {
        $(el).find('.slide-tab').click(function(event) {
            var index = $(this).index()
            var eq = (index - 1) / 2
            $('.slide').each(function(index, el) {
                $(el).find('.slide-tab').eq(eq).addClass('tab-current').siblings('.slide-tab').removeClass('tab-current')
                $(el).find('.slide-content').eq(eq).addClass('slide-content-show').siblings('.slide-content').removeClass('slide-content-show')
            });
        });
    });

    if ($('#sidebar .outer').find('input').val()) {
        platformsArr = $('#sidebar .outer').find('input').val().split(',');
        //动态生成目录
        $('#sidebar .inner .sidebar-nav .sidebar-nav-item').each(function(index, el) {
            var href = $(el).children('.sublist').find('.sublist-item').eq(0).children('a').attr('href');
            platformsLink.push(href)
        })

        platformsArr.forEach(function(ele, index) {
            var aEle = '<a class="platform-links" href=' + platformsLink[index] + '>' + ele + '</a>'
            var liEle = '<li class="item"> ' + aEle + '</li>';

            $('#sidebar .outer .platforms').append(liEle);
        });

        $('#sidebar .outer .selected').click(function(event) {
            event.stopPropagation();
            $(this).siblings('.platforms').slideToggle(100);
            $(this).toggleClass('ui');
        });

        $(document).click(function(e) {
            var _con = $('.platforms');
            if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                _con.slideUp(100)
                $('#sidebar .outer .selected').removeClass('ui')
            }

        });
    }

    //wilddog部分
    var config = {
        syncURL: "https://wd-download.wilddogio.com" //输入节点 URL
    };
    wilddog.initializeApp(config);
    var ref = wilddog.sync().ref();

    ref.on('value', function(snap) {
        //获取节点
        //auth
        var auth_web = snap.val().wilddog.auth.web;
        var auth_ios = snap.val().wilddog.auth.ios;
        var auth_android = snap.val().wilddog.auth.android;
        var auth_java = snap.val().wilddog.auth.java;
        //im
        var im_ios = snap.val().wilddog.im.ios;
        var im_android = snap.val().wilddog.im.android;
        //media
        var media_web = snap.val().wilddog.media.web;
        var media_ios = snap.val().wilddog.media.ios;
        var media_android = snap.val().wilddog.media.android;
        //sync
        var sync_web = snap.val().wilddog.sync.web;
        var sync_ios = snap.val().wilddog.sync.ios;
        var sync_android = snap.val().wilddog.sync.android;
        var sync_c = snap.val().wilddog.sync.c;
        var sync_embedded = snap.val().wilddog.sync.embedded;
        var sync_core = snap.val().wilddog.sync.core;

        //赋值
        //auth_start
        $('.auth_web_v').text(auth_web.version);
        $('.auth_ios_v').text(auth_ios.version);
        $('.auth_android_v').text(auth_android.version);
        $('.auth_java_v').text(auth_java.version);

        $("#auth_android_d").attr("href", 'https://cdn.wilddog.com/sdk/android/' + auth_android.version + '/wilddogAuth' + auth_android.version + '.zip');

        $("#auth_ios_d").attr("href", 'https://cdn.wilddog.com/sdk/ios/' + auth_ios.version + '/WilddogAuth.framework-' + auth_ios.version + '.zip');

        $("#auth_java_d").attr("href", 'https://cdn.wilddog.com/sdk/java/' + auth_java.version + '/wilddog-auth-sdk-' + auth_java.version + '.jar');

        $("#auth_android-md5").text(auth_android.checksum.md5sum);
        $("#auth_android-sha1").text(auth_android.checksum.sha1sum);
        $("#auth_android-sha256").text(auth_android.checksum.sha256sum);

        $("#auth_ios-md5").text(auth_ios.checksum.md5sum);
        $("#auth_ios-sha1").text(auth_ios.checksum.sha1sum);
        $("#auth_ios-sha256").text(auth_ios.checksum.sha256sum);

        $("#auth_java-md5").text(auth_java.checksum.md5sum);
        $("#auth_java-sha1").text(auth_java.checksum.sha1sum);
        $("#auth_java-sha256").text(auth_java.checksum.sha256sum);
        //auth_end

        //im_start
        $("#im_ios_d").attr("href", 'https://cdn.wilddog.com/sdk/ios/' + im_ios.version + '/WilddogIM.framework-' + im_ios.version + '.zip');

        $("#im_android_d").attr("href", 'https://cdn.wilddog.com/sdk/android/' + im_android.version + '/wilddog-im-' + im_ios.version + '.zip');

        $('.im_ios_v').text(im_ios.version);
        $('.im_android_v').text(im_android.version);

        $("#im_ios-md5").text(im_ios.checksum.md5sum);
        $("#im_ios-sha1").text(im_ios.checksum.sha1sum);
        $("#im_ios-sha256").text(im_ios.checksum.sha256sum);
        //im_end

        //media_start
        $('.media_web_v').text(media_web.version);
        $('.media_ios_v').text(media_ios.version);
        $('.media_android_v').text(media_android.version);
        //
        //media_end

        //sync_start
        $('.sync_web_v').text(sync_web.version);
        $('.sync_ios_v').text(sync_ios.version);
        $('.sync_android_v').text(sync_android.version);
        $('.sync_c_v').text(sync_c.version);
        $('.sync_embedded_v').text(sync_embedded.version);
        $('.sync_core_v').text(sync_core.version);

        $("#sync_android_d").attr("href", 'https://cdn.wilddog.com/sdk/android/' + sync_android.version + '/Wilddog_Sync_Android_' + sync_android.version + '_All.zip');

        $("#sync_ios_d").attr("href", 'https://cdn.wilddog.com/sdk/ios/' + sync_ios.version + '/WilddogVideo-' + sync_ios.version + '.zip');

        $("#sync_core_d").attr("href", 'https://cdn.wilddog.com/sdk/ios/' + sync_core.version + '/WilddogCore.framework-' + sync_core.version + '.zip');

        $("#sync_android-md5").text(sync_android.checksum.md5sum);
        $("#sync_android-sha1").text(sync_android.checksum.sha1sum);
        $("#sync_android-sha256").text(sync_android.checksum.sha256sum);

        $("#sync_c-md5").text(sync_c.checksum.md5sum);
        $("#sync_c-sha1").text(sync_c.checksum.sha1sum);
        $("#sync_c-sha256").text(sync_c.checksum.sha256sum);

        $("#sync_embedded-md5").text(sync_embedded.checksum.md5sum);
        $("#sync_embedded-sha1").text(sync_embedded.checksum.sha1sum);
        $("#sync_embedded-sha256").text(sync_embedded.checksum.sha256sum);

        $("#sync_ios-md5").text(sync_ios.checksum.md5sum);
        $("#sync_ios-sha1").text(sync_ios.checksum.sha1sum);
        $("#sync_ios-sha256").text(sync_ios.checksum.sha256sum);

        $("#sync_core-md5").text(sync_core.checksum.md5sum);
        $("#sync_core-sha1").text(sync_core.checksum.sha1sum);
        $("#sync_core-sha256").text(sync_core.checksum.sha256sum);
        //sync_end
    });



})
