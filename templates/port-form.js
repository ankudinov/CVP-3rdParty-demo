var switch_and_port = false;
var port_config = [];

d3.json("/json_data", function(error, json) {
    if (error) throw error;

    var panel = d3.select("#switch-tabs");
    var panel_content = d3.select("#switch-tabs-content");

    json.forEach(function(d, i) {
        var checkbox = d3.select("div.dyn-checkbox").append("div")
            .attr("class", "d3-checkbox")
            .append("label");
        checkbox.html("<input type=\"checkbox\" name=\""+d+"\">" + d);

        panel.append("li")
            .attr("class", "switch-tab")
            .classed("li_"+i, true)
            .append("a")
            .attr("href", "#tab_"+i)
            .html(d);

        var svg_id = "svg_"+d+"_"+i;

        panel_content.append("div")
            .attr("class", "tab-pane switch-tab-content")
            .attr("id", "tab_"+i)
            .append("svg")
            .style("margin", "10px")
            .style("width", "400px")
            .style("height", "200px")
            .attr("id", svg_id);

        if (i < 1) {
            d3.select("#tab_"+i).classed("active", true);
            d3.select("li.li_"+i).classed("active", true)
        }

        var coordinates = [
                "(0,0)",
                "(0,33)",
                "(33,0)",
                "(33,33)",
                "(66,0)",
                "(66,33)",
                "(99,0)",
                "(99,33)"
            ];

        coordinates.forEach(function (coord, num) {
            var sw_port = d3.selectAll("#"+svg_id).append("g")
              .attr("class", "switch-port")
              .attr("id", d+"_"+(num+1))
              .attr("transform", "translate"+coord);
            sw_port.append("rect")
              .style("width", "30px")
              .style("height", "30px")
              .style("fill", "#bcc6d6")
              .style("stroke", "black");
            sw_port.append("text")
              .style("fill", "black")
              .style("cursor", "pointer")
              .attr("transform", "translate(8,19)")
              .html("E"+(num+1))
        })
		});

    var port_clicked = false;
    panel.selectAll("li.switch-tab").on("click",
            function () {
                panel.selectAll("li").classed("active", false);
                panel_content.selectAll("div.switch-tab-content").classed("active", false);
                d3.select(this).classed("active", true);
                var tab_content_id = d3.select(this).select("a").attr("href");
                d3.selectAll(tab_content_id).classed("active", true);

                if (port_clicked) {
                  d3.select("#port-config").remove();
                  port_clicked = false;
                }
            }
        );

    d3.selectAll("g.switch-port").on("click",
        function () {
          if (port_clicked) {
              d3.select("#port-config").remove();
              port_clicked = false;
          }
          else {
              switch_and_port = d3.select(this).property("id");

              port_clicked = true;
              var coordinates = d3.mouse(this);
              d3.select(this.parentNode).append("foreignObject")
                  .attr("id", "port-config")
                  .style("x", coordinates[0])
                  .style("y", coordinates[1])
                  .style("width", "300px")
                  .style("height", "200px")
                  .append("xhtml:body")
                  .attr("id", "port-config-body")
                  .style("width", "300px")
                  .style("height", "130px")
                  .style("border", "1px lightgray solid")
                  .style('background-color', '#FCF3CF');
              d3.select('#port-config-body').append("form")
                  .attr("id", "port-role-form")
                  .style("margin-left", "10px")
                  .style("margin-top", "10px")
                  .append("label")
                  .attr("class", "radio-inline access-port")
                  .append("input")
                  .attr("id", "is-access")
                  .attr("type", "radio")
                  .attr("name", "port-type");
              d3.select('label.access-port').append("text").html("Access Port");
              d3.select('#port-role-form').append("label")
                  .attr("class", "radio-inline trunk-port")
                  .append("input")
                  .attr("id", "is-trunk")
                  .attr("type", "radio")
                  .attr("name", "port-type");
              d3.select('label.trunk-port').append("text").html("Trunk Port");
              d3.select('#port-config-body').append("form")
                  .attr("class", "form-horizontal")
                  .attr("id", "port_form")
                  .append("div")
                  .attr("class", "form-group")
                  .append("input")
                  .attr("type", "text")
                  .attr("class", "form-control col-sm-2")
                  .attr("id", "port_vlans")
                  .attr("placeholder", "Acess VLAN or allowed VLAN list")
                  .style("width", "250px")
                  .style("margin-top", "5px")
                  .style("margin-left", "25px");
              d3.select("#port_form").append("div")
                  .attr("class", "form-group")
                  .append("div")
                  .attr("class", "col-sm-offset-2 col-sm-10")
                  .append("button")
                  .style("margin-right", "10px")
                  .style("margin-bottom", "10px")
                  .attr("type", "submit")
                  .attr("class", "btn btn-default pull-right")
                  .attr("onclick", "return savePortCfg()")
                  .html("Save")
          }
        }
    );

    d3.selectAll("g.switch-port").on("contextmenu",
        function () {
            d3.event.preventDefault();
            if (port_clicked == false) {
              switch_and_port = d3.select(this).property("id");
              var switch_name = switch_and_port.match(re_hostname)[0].slice(0, -1);
              var port_number = switch_and_port.match(re_port_number)[0].slice(1);

              var coordinates = d3.mouse(this);
              d3.select(this.parentNode).append("foreignObject")
                  .attr("id", "port-current-status")
                  .style("x", coordinates[0])
                  .style("y", coordinates[1])
                  .style("width", "150px")
                  .style("height", "50px")
                  .append("xhtml:body")
                  .style("width", "150px")
                  .style("height", "50px")
                  .style("border", "1px lightgray solid")
                  .style('background-color', '#FCF3CF')
                  .attr("id", "port-status-body");
              var port_status = d3.select("#port-status-body");
              if (port_config[switch_name] == undefined) {
                  port_status.append("text").html("NOT CONFIGURED!")
              }
              else {
                  if (port_config[switch_name][port_number] == undefined) {
                      port_status.append("text").html("NOT CONFIGURED!")
                  }
                  else {
                    var port_type = 'Not defined!';
                    if (port_config[switch_name][port_number]['port_type'] == 'is-access') {
                        port_type = 'access port'
                    }
                    if (port_config[switch_name][port_number]['port_type'] == 'is-trunk') {
                        port_type = 'trunk port'
                    }
                    var port_vlan = port_config[switch_name][port_number]['port_vlan'];
                    port_status.append("text")
                        .html("<strong>Port type: </strong>"+port_type+"<br>"+"<strong>VLAN list: </strong>"+port_vlan)
                  }
              }
            }
        });

    d3.selectAll("g.switch-port").on("mouseout",
        function () {
            d3.select("#port-current-status").remove();
        });
});

var re_hostname = /^.*_/;
var re_port_number = /_.*$/;

function savePortCfg() {

    var port_type = d3.select('input[type="radio"]:checked').property("id");
    var port_vlan = d3.select('#port_vlans').property("value");

    var switch_name = switch_and_port.match(re_hostname)[0].slice(0, -1);
    var port_number = switch_and_port.match(re_port_number)[0].slice(1);

    if (port_config[switch_name] == undefined) {
        port_config[switch_name] = {};
        if (port_config[switch_name][port_number] == undefined) {
            port_config[switch_name][port_number] = {}
        }
    }

    port_config[switch_name][port_number] = {
        'port_type': port_type,
        'port_vlan': port_vlan
    };

    return false
}

$(function(){
    $('#PORT_form').on('submit', function(event){
        event.preventDefault();

        var data = [];

        Object.keys(port_config).forEach(function (t) {
            Object.keys(port_config[t]).forEach(function (t2) {
                data.push({
                    'switch': t,
                    'port': t2,
                    'port_type': port_config[t][t2]['port_type'],
                    'port_vlan': port_config[t][t2]['port_vlan']
                })
            })
        });

        $.ajax({
            url: '/processing_ports',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            dataType: 'json',
            success: $('#add-alert-here').append("<div class=\"alert alert-success alert-dismissible\" role=\"alert\">\n" +
                "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n" +
                "  <strong>Success!</strong> Port configlet was created and assigned to corresponding leafs on CVP.\n" +
                "</div>")
        });
    });
});