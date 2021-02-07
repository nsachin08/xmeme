MemesClient.prototype.initEvents = function () {
    var self = this;
    $(document).on('click', '#cancel-meme-btn', function () {
        $('.side-nav').removeClass('d-flex').addClass('d-none');
        $('.side-nav-edit').removeClass('d-flex').addClass('d-none');
    });
    $(document).on('click', '.open-create', function () {
        $('.side-nav').addClass('d-flex').removeClass('d-none');
    });
    $(document).on('click', '.open-edit', function () {
        var memeId = $(this).data('meme-id');
        var data = self.memes.find(a => a.id == memeId);
        $('#edit-name').val(data.name);
        $('#edit-caption').val(data.caption);
        $('#edit-url').val(data.url);
        $('#edit-img-preview').attr('src', data.url);
        $('#edit-meme-btn').data('meme-id', data.id);

        $('.side-nav-edit').addClass('d-flex').removeClass('d-none');
    });
    $(document).on('click', '#create-meme-btn', function () {
        var name = $('#name').val();
        var caption = $('#caption').val();
        var url = $('#url').val();
        var errMsg = [];
        var isUrlValid = self.isValidHttpUrl(url);


        if (name.trim().length == 0 || caption.trim().length > 500 || url.trim().length == 0 || !isUrlValid) {
            if (name.trim().length == 0) {
                errMsg.push("Name cannot be empty");

            }
            if (caption.trim().length > 500) {
                errMsg.push("Caption text cannot be greater than 500 characters");
            }
            if (url.trim().length == 0) {
                errMsg.push("Url cannot be empty");
            }

            if (!isUrlValid) {
                errMsg.push("Url is not valid");
            }

            self.createAlert(false, errMsg);
        } else {
            $.ajax({
                url: `/memes`,
                method: 'POST',
                data: { name, caption, url },
                success: (data) => {
                    if (data.id !== null) {
                        self.memes.unshift({ id: data.id,name, caption, url, created: new Date(), likes: 0 });
                        self.showMemes();
                    }
                    self.createAlert(true, "Meme Posted Successfully.");
                },
                error: function (err) {
                    console.log(err);
                    if (err.status == 409) {
                        self.createAlert(false, [`Meme already exist ${err.status} : ${err.statusText}`]);
                    } else
                        self.createAlert(false, [`Request failed with code ${err.status} : ${err.statusText}`]);
                }
            });
        }
    });

    $(document).on('click', '#edit-meme-btn', function () {
        memeId = $(this).data('meme-id');
        var caption = $('#edit-caption').val();
        var url = $('#edit-url').val();
        var errMsg = [];
        var isUrlValid = self.isValidHttpUrl(url);

        var currMeme = self.memes.find(a=>a.id == memeId);


        if (caption.trim().length > 500 || url.trim().length == 0 || !isUrlValid || (currMeme.caption == caption && currMeme.url == url)) {

            if (caption.trim().length > 500) {
                errMsg.push("Caption text cannot be greater than 500 characters");
            }
            if (url.trim().length == 0) {
                errMsg.push("Url cannot be empty");
            }

            if (!isUrlValid) {
                errMsg.push("Url is not valid");
            }
            if(currMeme.caption == caption && currMeme.url == url){
                errMsg.push("No Changes to Update");
            }

            self.createAlert(false, errMsg);
        } else {
            var data={};
            if(currMeme.caption !== caption){
                data['caption'] = caption;
            }
            if(currMeme.url !== url){
                data['url'] = url;
            }

            $.ajax({
                url: `/memes/${memeId}`,
                method: 'PATCH',
                data: data,
                success: (data) => {

                    currMeme.caption = caption;
                    currMeme.url = url;
                    self.showMemes();

                    self.createAlert(true, "Meme Updated Successfully.");
                },
                error: function (err) {
                    console.log(err);
                    if (err.status == 409) {
                        self.createAlert(false, [`Meme already exist ${err.status} : ${err.statusText}`]);
                    } else
                        self.createAlert(false, [`Request failed with code ${err.status} : ${err.statusText}`]);
                }
            });
        }
    });

    $(document).on('blur', '#url', function () {
        var url = $(this).val();

        if (url.trim().length == 0) {
            $('#img-preview').attr('src', 'https://i.imgflip.com/4wymt6.jpg');
            return;
        }

        $.ajax({
            url: url,
            method: 'GET',
            success: function () {
                $('#img-preview').attr('src', url);
            },
            error: function (err) {
                $('#img-preview').attr('src', 'https://lh3.googleusercontent.com/proxy/uL-_Tdc3YMt8dtD7NiLwmn02HrpPduoOSnKGDGQdcMJAcXwh0qeTLk3rBihPf44P6pwLHuJiAvXtZwl_hyXoJra3VVpKcq_jcaiBSq0FVqCIPBHj8MD6l6WBpQ4DjKTpm_LTBjXbG2IKW6ENI8ssOU2GuVTdHq9Gy0o');
            }
        })


    });

    $(document).on('click', '.theme-changer', function () {
        $('body').toggleClass('dark');
        var isDark = $('body').hasClass('dark');
        if (isDark) {
            localStorage.setItem("light", 'false');
        } else {
            localStorage.setItem("light", 'true');
        }

    });

    $(document).on('click', '.close-alert', function () {
        $(this).parent().removeClass('d-flex').addClass("d-none");
    });

    $(document).on('click', '.meme-like-btn', function () {
        var currLikeBtnRef = this;
        var memeId = $(this).data('meme-id');
        var meme = self.memes.find(a => a.id == memeId);
        var noOfLikes = meme.likes;
        var hasLiked = $(this).hasClass('liked');
        if (hasLiked == false) {
            $(this).addClass('liked');
            $(this).attr('name', 'heart');
            localStorage.setItem(memeId, true);
            noOfLikes += 1;
        } else {
            $(this).removeClass('liked');
            $(this).attr('name', 'heart-outline');
            localStorage.setItem(memeId, false);
            noOfLikes -= 1;
        }

        if (memeId !== null || memeId !== '') {
            $.ajax({
                url: `/memes/${memeId}`,
                method: 'PATCH',
                data: {
                    likes: noOfLikes
                },
                success: (data) => {
                    meme.likes = noOfLikes;
                    $(currLikeBtnRef).siblings('p').text(`${noOfLikes} Likes`);
                },
                error: function (err) {

                }
            });
        }
    });

}

MemesClient.prototype.initEventsTop10 = function () {
    var self = this;
    $(document).on('change', '#top10-range', function () {
        var curr = $('#top10-range').val() || 1;

        self.getMemesTop10(curr, (data) => {
            console.log(data);
            self.top10 = [...data];
            self.showTop10Memes();
        });
    });
}