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
/*global define, brackets */

define(function (require, exports) {
    "use strict";

    var _                     = brackets.getModule("thirdparty/lodash"),
        ProjectManager        = require("src/project/ProjectManager"),
        BracketsConfiguration = require("src/configuration/BracketsConfiguration"),
        DefaultConfiguration  = require("src/configuration/DefaultConfiguration"),
        ErrorUtils            = require("src/utils/ErrorUtils");

    function getConfiguration() {
        var config,
            bowerRc,
            project = ProjectManager.getProject();

        if (!project) {
            ErrorUtils.createError(ErrorUtils.NO_PROJECT);
        }

        if (project.hasBowerRc()) {
            bowerRc = project.activeBowerRc;

            config = bowerRc.Data;
        } else {
            config = DefaultConfiguration.getConfiguration();
        }

        config = _.extend(config, BracketsConfiguration.getConfiguration());

        config.cwd = project.getPath();

        return _.clone(config, true);
    }

    function _init() {
        BracketsConfiguration.init();
        DefaultConfiguration.init();
    }

    _init();

    exports.getConfiguration        = getConfiguration;
});
