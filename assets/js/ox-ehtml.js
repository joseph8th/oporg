// Copyright (C) 2012 Eric Schulte <schulte.eric@gmail.com>
// License GPLV3
// This fork modified by Joseph Edwards VIII <jedwards8th@gmail.com>

// after the page loads, run the set set_clickable function
$(document).ready( function(){ set_clickable(); } );

function set_clickable(){
    oporg_process_outline();      // [JE] calls funcs in oporg.js

    // add edit button to every element with class="edit_in_place"
    $('.edit_button').remove();
    $('.edit_in_place')
        .before('<input type="button" value="EDIT" class="edit_button">');

    $('.edit_button').click(function(){
        var main = $(this).next();
        var org  = main.next().html();
        var beg  = main.next().attr("contents-begin");
        var end  = main.next().attr("contents-end");
        var html = main.html();

        // TODO [JE]: replace with handlebars template
        var div_str = '<div class="edit_org_widget">'
            + '<textarea id="editing" class="edit_org">' + org + '</textarea>'
            + '<div><input type="button" value="SAVE" class="save_button" />'
            + '<input type="button" value="CANCEL" class="cancel_button" />'
            + '</div></div>';
        main.after(div_str);
        // TODO [JE]: set_autoresize('textarea#editing');

        // remove all edit buttons & the original html
        $('.edit_button').remove();
        main.remove();

        // call these functions when buttons are hit
        $('.save_button').click(function(){
            var saveorg = $(this).parent().prev().val();
            save_changes(this, saveorg, beg, end);
            //unset_autoresize();
        });
        $('.cancel_button').click(function(){
            abort_changes(this, html);
            //unset_autoresize();
        });
    });

    // TODO: show edit button on mousover
    $('.edit_in_place').hover(function(){ $(this).prev().show(); },
                              function(){ $(this).prev().hide(); } );
    $('.edit_button').hover(function(){ $(this).show(); },
                            function(){ $(this).hide(); } );
};

function save_changes(obj, org, beg, end){
    var here = window.location.pathname;

    // TODO
    console.log("begin/end:", beg, end, "org:", org);
    //return false;

    $.ajax({
        type: 'POST',
        url: here,
        data: {org:  org,
               beg:  beg,
               end:  end,
               path: here},
        statusCode: {
            200: function(html,status){
                $(obj).parent().parent().next().after(
                    '<div class="edit_in_place">'+html+'</div>'+
                        '<div class="raw-org" contents-begin="'+beg+
                        '" contents-end="'+end+'">'+org+'</div>');
                if(typeof(MathJax) !== 'undefined') {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub,
                                       $(obj).parent().parent().next().next().get()]);
                }
                $(obj).parent().parent().next().remove();
                $(obj).parent().parent().remove();
                update_offsets(end, (org.length - (Number(end) - Number(beg))));
                set_clickable();
            },
            403: function(){ alert("Unauthorized"); },
            500: function(error){ alert('error:'+error); }
        }
    });
};

function abort_changes(obj, old_html){
    $(obj).parent().parent().after(
        '<div class="edit_in_place">'+old_html+'</div>');
    $(obj).parent().parent().remove();
    set_clickable();
};

function update_offsets(end, delta){
    $('.raw-org').map(function(){
        var old_beg = Number($(this).attr('contents-begin'));
        if(old_beg >= end) { $(this).attr('contents-begin', (old_beg + delta)); }
        var old_end = Number($(this).attr('contents-end'));
        if(old_end >= end) { $(this).attr('contents-end', (old_end + delta)); }
    });
};
