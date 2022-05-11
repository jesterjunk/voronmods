var mods = {};
var listMods = $('#listMods');
var inputKeyword = $('#inputKeyword');
var globalTags = {};
var baseUrl = 'https://github.com/VoronDesign/VoronUsers/blob/master'
var previews = [];

const hoverPreview = window.hoverPreview;

inputKeyword.keyup(function () {
    filterMods(inputKeyword.val());
});

$(document).ready(function () {
    getMods();
});

function getMods() {
    $.getJSON('data/mods.json')
        .done(function (data) {
            mods = data;
            $.each(mods, function (i, mod) {
                addMod(mod);
            });
            showTags();
            lazyload();
        })
        .fail(function (jqxhr, textStatus, error) {
            handleError(jqxhr, textStatus, error);
        });
}

function filterMods(keyword) {
    listMods.empty();
    keyword = keyword.toLowerCase();
    var filterByTag = false;
    $.each(globalTags, function (i, globalTag) {
        if (globalTag !== 1) {
            filterByTag = true;
        }
    })
    $.each(mods, function (i, mod) {
        if (
            keyword === '' ||
            mod.creator.toLowerCase().indexOf(keyword) >= 0 ||
            mod.title.toLowerCase().indexOf(keyword) >= 0 ||
            mod.descr.toLowerCase().indexOf(keyword) >= 0
        ) {
            if (filterByTag) {
                $.each(mod.tags, function (modTag, modStatus) {
                    if (modStatus !== 1 && globalTags[modTag] === modStatus) {
                        addMod(mod);
                        return false;
                    }
                });
            } else {
                addMod(mod);
            }
        }
    })
    lazyload();
}

function addMod(mod) {
    var tags = '';
    $.each(mod.tags, function (key, value) {
        var status = 'bg-warning';
        switch (value) {
            case 0:
                status = 'bg-danger';
                break;
            case 1:
                status = 'bg-secondary';
                break;
            case 2:
                status = 'bg-success';
        }
        tags = tags + '<span class="badge ' + status + '">' + key.replace('_', '.') + '</span>&nbsp;';
        if (!(key in globalTags)) {
            globalTags[key] = 1;
        }
    })

    var item = $('<li class="list-group-item d-flex justify-content-between align-items-start p-3">' +
        '<div><img class="thumbnail" src="" data-src="cache/thumbs/' + mod.md5 + '_thumb.jpg" ' +
        'data-preview="cache/thumbs/' + mod.md5 + '_preview.jpg">' +
        '</div>' +
        '<div class="ms-2 me-auto">' +
        '<div class="fw-bold"><a href="' + baseUrl + '/' + mod.dir + '" target="_blank">' + mod.title + '</a> <small class="text-muted">by ' + mod.creator + '</small></div>' +
        mod.descr +
        '</div>' +
        '<div>'+tags.trim()+'</div>'+
        '</li>');
    listMods.append(item);
}

function showTags() {
    var listTags = $('#listTags');
    $.each(globalTags, function (tag, status) {
        var item = '<li class="nav-item my-1 text-center">' +
            '<a href="#" class="nav-link btnTag text-white bg-secondary" data-tag="' + tag + '" data-status="' + status + '">' +
            tag.replace('_', '.') +
            '</a>' +
            '</li>';
        listTags.append(item);
    });
    $('.btnTag').on('click', function () {
        toggleTag($(this).data('tag'));
    })
}

function toggleTag(tag) {
    var btn = $('.btnTag[data-tag="' + tag + '"]');
    switch (btn.data('status')) {
        case 0:
            btn.removeClass('bg-danger').addClass('bg-secondary').data('status', 1).blur();
            globalTags[tag] = 1;
            break;
        case 1:
            btn.removeClass('bg-secondary').addClass('bg-success').data('status', 2).blur();
            globalTags[tag] = 2;
            break;
        case 2:
            btn.removeClass('bg-success').addClass('bg-danger').data('status', 0).blur();
            globalTags[tag] = 0;
    }
    filterMods(inputKeyword.val());
}


function lazyload() {
    $('img.thumbnail').Lazy({
        appendScroll: $('#main'),
        scrollDirection: 'vertical',
        effect: 'fadeIn',
        effectTime: 500,
        threshold: 100,
        throttle: 18,
        defaultImage: "data:image/png;base64,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"
    });
    var previews = [...document.querySelectorAll('.thumbnail')].map((element, index) =>
    {
        return hoverPreview(element, {
            source : $(element).data('preview')
        });
    });
}

function handleError(jqxhr, textStatus, error) {
    console.log("request failed");
    console.log('textStatus: ' + textStatus);
    console.log('error: ' + error);
    alert(textStatus);
}
