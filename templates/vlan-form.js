$(function(){
    $('#VLAN_form').on('submit', function(event){
        event.preventDefault();

        var names = [];

        $('input[type=checkbox]').each(function () {
            if ($(this).is(':checked')) {
                names.push($(this).attr("name"));
            }
        });

        var formData = {
            'vlan_number': $('input[id=vlan_number]').val(),
            'vlan_name': $('input[id=vlan_name]').val(),
            'checkbox': names
        };

        $.ajax({
            url: '/processing',
            type: 'POST',
            data: formData,
            dataType: 'json',
            encode: true,
            success: $('#add-alert-here').append("<div class=\"alert alert-success alert-dismissible\" role=\"alert\">\n" +
                "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n" +
                "  <strong>Success!</strong> VLAN configlet was created and assigned to selected leafs on CVP.\n" +
                "</div>"),
            //success: location.href = "/success",
            //success: alert('Request sent to CVP!'),
            traditional: true
        });
    });
});