/* @license
 *
 * Copyright 2015 ARM Ltd
 */
(function(global, factory) {
    if (typeof exports === 'object') {
        // CommonJS (Node)
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser global (with support for web workers)
        global.mbedCompileApi = factory();
    }
}(this, function() {
    'use strict';

    // Constants and defaults
    var defaultDomain = "https://developer.mbed.org";
    var api = "/api/v2/tasks/compiler/";

    // Constructor
    var mbedCompileApi = function(logFn, domain) {
        this.logFn = logFn;
        this.domain = domain || defaultDomain;
        this.api = this.domain + api;
    };

    // Set Creds
    mbedCompileApi.prototype.setCredentials = function(username, password) {
        var tok = username + ':' + password;
        $.ajaxSetup({
            headers: {
                "Authorization": "Basic " + btoa(tok)
            }
        });
    };

    // Begin a build
    mbedCompileApi.prototype.build = function(element, repo, target) {
        var symbols = [];

        $(element).find("input").each(function() {
            var input = $(this);
            var param = input.attr("name");
            var type = input.attr("type");
            var value = input.val();

            if (type === "text") {
                value = '"' + value +'"';
            }

            symbols.push(param + "=" + value);
        });

        var payload = {
            platform: target,
            repo: this.domain + "/" + repo,
            clean: false,
            extra_symbols: symbols.join(",")
        };

        this.retryBuild(payload);
    };

    // Keep trying to initiate build every 200ms until it works
    mbedCompileApi.prototype.retryBuild = function(payload) {
        this.initiateBuild(payload, function(success) {
            if (!success) {
                setTimeout(function() {
                    this.retryBuild(payload);
                }.bind(this), 200);
            }
        }.bind(this));
    };

    // Start the build
    mbedCompileApi.prototype.initiateBuild = function(payload, callback) {
        $.ajax({
            url: this.api + "start/",
            type: "POST",
            data: payload,
            success: function(response) {
                var uuid = response.result.data.task_id;
                this.logFn(uuid);
                setTimeout(function() {
                    this.pollProgress(uuid);
                }.bind(this), 0);
                callback(true);
            }.bind(this),
            error: function(response) {
                if (response.status == 500) {
                    callback(false);
                } else {
                    this.logFn(response.responseText);
                    callback(true);
                }
            }.bind(this)
        });
    };

    // See how we are getting on
    mbedCompileApi.prototype.pollProgress = function(uuid) {
        $.ajax({
            url: this.api + "output/" + uuid,
            success: function(response) {
                var messages = response.result.data.new_messages;

                for (var i in messages) {
                    var message = messages[i];

                    if (message.message) {
                        this.logFn(message.type + ": " + message.message);
                    }

                    if (message.action && message.percent) {
                        this.logFn(message.action + ": " + message.percent);
                    } else if (message.action) {
                        this.logFn(message.action + ": " + message.file);
                    }
                }

                if (response.result.data.task_complete) {
                    if (response.result.data.compilation_success) {
                        this.logFn("success");
                        this.downloadFile(response.result.data, uuid);
                    } else {
                        this.logFn("failed");
                    }
                } else {
                    setTimeout(function() {
                        this.pollProgress(uuid);
                    }.bind(this), 0);
                }
            }.bind(this),
            error: function(response) {
                this.logFn(response.responseText);
            }.bind(this)
        });
    };

    // Download our built file
    mbedCompileApi.prototype.downloadFile = function(data, uuid) {
        var payload = {
            repomode: true,
            program: data.program,
            binary: data.binary,
            task_id: uuid
        };

        $.ajax({
            url: this.api + "bin/",
            data: payload,
            dataType: "blob",
            success: function(response, status, xhr) {
                var filename = data.binary;
                var type = xhr.getResponseHeader('Content-Type');
                var blob = new Blob([response], { type: type });

                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    window.navigator.msSaveBlob(blob, filename);
                } else {
                    var URL = window.URL || window.webkitURL;
                    var downloadUrl = URL.createObjectURL(blob);

                    var a = document.createElement("a");
                    if (typeof a.download === 'undefined') {
                        window.location.href = downloadUrl;
                    } else {
                        a.href = downloadUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();

                        // Cleanup
                        setTimeout(function() {
                            URL.revokeObjectURL(downloadUrl);
                        }, 500);
                    }
                }
            },
            error: function(response) {
                this.logFn(response.responseText);
            }.bind(this)
        });
    };

    // jQuery extension to support blob downlaods
    $.ajaxTransport("+*", function(options, originalOptions, jqXHR){
        if (options.dataType && options.dataType == "blob") {
            return {
                send: function(headers, completeCallback){
                    var xhr = new XMLHttpRequest();
                    var url = options.url || window.location.href;
                    var type = options.type || "GET";
                    var dataType = options.dataType;
                    var data = options.data || null;
                    var async = options.async || true;

                    xhr.addEventListener("load", function() {
                        var response = {};
                        response[dataType] = xhr.response;
                        completeCallback(xhr.status, xhr.statusText, response, xhr.getAllResponseHeaders());
                    });

                    xhr.open(type, url, async);
                    for (var header in headers) {
                        xhr.setRequestHeader(header, headers[header]);
                    }

                    xhr.responseType = dataType;
                    xhr.send(data);
                },
                abort: function(){
                    jqXHR.abort();
                }
            };
        }
    });

    return mbedCompileApi;
}));