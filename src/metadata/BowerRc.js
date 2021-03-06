/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 - 2016 Intel Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global $, define, brackets */

define(function (require, exports, module) {
    "use strict";

    var _             = brackets.getModule("thirdparty/lodash"),
        BowerMetadata = require("src/metadata/BowerMetadata"),
        FileUtils     = require("src/utils/FileUtils"),
        ErrorUtils    = require("src/utils/ErrorUtils"),
        Strings       = require("strings");

    /**
     * Configuration file constructor.
     * @param {BowerProject} project
     * @constructor
     */
    function BowerRc(project) {
        BowerMetadata.call(this, ".bowerrc", project);

        /** @private */
        this._data = {};
    }

    BowerRc.prototype = Object.create(BowerMetadata.prototype);
    BowerRc.prototype.constructor = BowerRc;
    BowerRc.prototype.parentClass = BowerMetadata.prototype;

    /** @const */
    BowerRc.Defaults = {
        directory: "bower_components",
        interactive: false
    };

    Object.defineProperty(BowerRc.prototype, "Data", {
        get: function () {
            return _.clone(this._data, true);
        },
        set: function (data) {
            this._data = data;
        }
    });

    BowerRc.prototype.create = function () {
        var content = this._defaultContent();

        return this.saveContent(content);
    };

    BowerRc.prototype.loadConfiguration = function () {
        return this._getFileContent()
            .then(function (configuration) {
                var configChanged = this._getConfigChanged(configuration);

                this.Data = configuration;

                return configChanged;
            }.bind(this));
    };

    BowerRc.prototype.onContentChanged = function () {
        return this.loadConfiguration();
    };

    /**
     * Update the directory location configuration.
     * @string {string} directory
     * @return {$.Promise}
     */
    BowerRc.prototype.setDirectory = function (directory) {
        this._data.directory = directory;

        var dataToSave = JSON.stringify(this._data, null, 4);

        return this.saveContent(dataToSave);
    };

    /**
     * @param {object} configuration
     * @return {Array | null}
     * @private
     */
    BowerRc.prototype._getConfigChanged = function (configuration) {
        var configChanged = [];

        if (!_.isEqual(this.Data.directory, configuration.directory)) {
            configChanged.push("directory");
        }

        return (configChanged.length > 0) ? configChanged : null;
    };

    /**
     * @private
     */
    BowerRc.prototype._defaultContent = function () {
        var defaultConfiguration = {
            directory: BowerRc.Defaults.directory + "/",
            interactive: BowerRc.Defaults.interactive
        };

        return JSON.stringify(defaultConfiguration, null, 4);
    };

    /**
     * @return {$.Promise}
     * @private
     */
    BowerRc.prototype._getFileContent = function () {
        return this.read().then(function (result) {
            try {
                return JSON.parse(result);
            } catch (ex) {
                console.log("[bower] Error parsing .bowerrc", ex);

                return $.Deferred().reject(ErrorUtils.createError(ErrorUtils.EMALFORMED_BOWERRC, {
                    message: Strings.ERROR_MSG_MALFORMED_BOWERRC,
                    originalMessage: ex.message
                }));
            }
        });
    };

    /**
     * Checks if the file exists in the given directory. If the directory
     * is not set, the root project directory is taken as the default directory.
     * @param {string} path
     * @return {Promise}
     */
    BowerRc.findInPath = function (path) {
        return FileUtils.exists(path + ".bowerrc");
    };

    module.exports = BowerRc;
});
