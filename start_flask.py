#!/usr/bin/env python3

__author__ = 'Petr Ankudinov'

cvp_ip = '192.168.178.123'
cvp_user = 'cvpadmin'
cvp_password = 'arista'

from flask import Flask, render_template, request
import json
from flask_bootstrap import Bootstrap
from cvprac.cvp_client import CvpClient
from cvprac.cvp_api import CvpApi
import re

app = Flask(__name__)
bootstrap = Bootstrap(app)

vlan_number = None
vlan_name = None


def load_cvp_data():
    clnt = CvpClient()
    clnt.connect([cvp_ip], cvp_user, cvp_password)
    api = CvpApi(clnt)
    leaf_inventory = api.get_devices_in_container('LEAF')
    leaf_fqdn_list = list()
    for element in leaf_inventory:
        hostname = re.split('\.', element['fqdn'])[0]
        leaf_fqdn_list.append(hostname)
    return leaf_fqdn_list


def add_configlet(configlet_name, configlet_string, switch_list):
    clnt = CvpClient()
    clnt.connect([cvp_ip], cvp_user, cvp_password)
    api = CvpApi(clnt)

    api.add_configlet(configlet_name, configlet_string)
    for switch_name in switch_list:
        switch_id = api.get_device_by_name(switch_name)
        configlet_id = api.get_configlet_by_name(configlet_name)
        api.apply_configlets_to_device('3rd-party', switch_id, [configlet_id], create_task=True)

    return 'Ignore'


@app.route("/d3.v4.min.js")
def d3v4():
    return render_template("d3.v4.min.js")


@app.route('/')
def index():
    return render_template("innovate_test.html")


@app.route('/processing', methods=['POST'])
def processing():
    global vlan_name, vlan_number, checkbox_list
    vlan_name = request.form['vlan_name']
    vlan_number = request.form['vlan_number']
    checkbox_list = request.form.getlist('checkbox')
    # get keys
    # for key in request.form.keys():
    #    pass

    configlet_name = "3rd-party-vlan-%s" % vlan_number

    configlet_string = """\
    vlan %s
      name %s
    """ % (vlan_number, vlan_name)

    add_configlet(configlet_name, configlet_string, checkbox_list)  # send data to CVP

    return 'Ignore'


@app.route('/success')
def success():
    # return 'VLAN number: %s; VLAN name: %s; Checkboxes: %s' % (vlan_number, vlan_name, checkbox_list)
    return render_template('success.html', vlan_number=vlan_number, vlan_name=vlan_name, checkbox_list=checkbox_list)


@app.route("/json_data")
def json_data():
    data = load_cvp_data()
    jsonData = json.dumps(data)
    return jsonData


if __name__ == '__main__':
    app.run(port=5000, debug=True)
