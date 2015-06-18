/*
 * Copyright (c) 2014 Narciso Jaramillo. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global define */

define(function (require, exports, module) {
    "use strict";

    var PackageUtils = require("src/bower/PackageUtils"),
        semver       = require("thirdparty/semver/semver.browser"); // TODO: temporary fix, update to require "semver" module

    var DependencyType = PackageUtils.DependencyType;

    /**
     * Constructor function for Bower package instances.
     * @param {string} name
     * @constructor
     */
    function Package(name) {
        /** @private */
        this._name = name;
        /** @private */
        this._version = null;
        /** @private */
        this._latestVersion = null;
        /** @private */
        this._bowerJsonVersion = null;
        /** @private */
        this._description = null;
        /** @private */
        this._homepage = null;
        /** @private */
        this._source = null;
        /** @private */
        this._installationDir = null;
        /** @private */
        this._isProjectDependency = true; // default
        /** @private */
        this._status = PackageUtils.Status.INSTALLED;
        /** @private */
        this._dependencyType = DependencyType.PRODUCTION;
        /** @private */
        this._dependencies = {};
        /** @private */
        this._dependants = [];
    }

    Object.defineProperty(Package.prototype, "name", {
        get: function () {
            return this._name;
        }
    });

    Object.defineProperty(Package.prototype, "version", {
        set: function (version) {
            this._version = version;
        },
        get: function () {
            return this._version;
        }
    });

    Object.defineProperty(Package.prototype, "latestVersion", {
        set: function (latestVersion) {
            this._latestVersion = latestVersion;
        },
        get: function () {
            return this._latestVersion;
        }
    });

    Object.defineProperty(Package.prototype, "bowerJsonVersion", {
        set: function (bowerJsonVersion) {
            this._bowerJsonVersion = bowerJsonVersion;
        },
        get: function () {
            return this._bowerJsonVersion;
        }
    });

    Object.defineProperty(Package.prototype, "status", {
        set: function (status) {
            this._status = status;
        },
        get: function () {
            return this._status;
        }
    });

    Object.defineProperty(Package.prototype, "dependencyType", {
        set: function (dependencyType) {
            this._dependencyType = dependencyType;
        },
        get: function () {
            return this._dependencyType;
        }
    });

    Object.defineProperty(Package.prototype, "description", {
        set: function (description) {
            this._description = description;
        },
        get: function () {
            return this._description;
        }
    });

    Object.defineProperty(Package.prototype, "homepage", {
        set: function (homepage) {
            this._homepage = homepage;
        },
        get: function () {
            return this._homepage;
        }
    });

    Object.defineProperty(Package.prototype, "source", {
        set: function (source) {
            this._source = source;
        },
        get: function () {
            return this._source;
        }
    });

    Object.defineProperty(Package.prototype, "isProjectDependency", {
        set: function (isProjectDependency) {
            this._isProjectDependency = isProjectDependency;
        },
        get: function () {
            return this._isProjectDependency;
        }
    });

    /**
     * Absolute path of the package installation directory.
     */
    Object.defineProperty(Package.prototype, "installationDir", {
        set: function (installationDir) {
            this._installationDir = installationDir;
        },
        get: function () {
            return this._installationDir;
        }
    });

    /**
     * @param {PackageDependency} dependency
     */
    Package.prototype.addDependency = function (dependency) {
        if (dependency) {
            this._dependencies[dependency.name] = dependency;
        }
    };

    /**
     * @param {string} name
     */
    Package.prototype.removeDependency = function (name) {
        var dependency = this._dependencies[name];

        if (dependency) {
            delete this._dependencies[name];
        }
    };

    /**
     * @return {boolean}
     */
    Package.prototype.hasDependencies = function () {
        if (this._dependencies) {
            return (Object.keys(this._dependencies).length !== 0);
        } else {
            return false;
        }
    };

    /**
     * @param {string} name
     * @return {boolean}
     */
    Package.prototype.hasDependency = function (name) {
        return (this._dependencies[name] !== undefined);
    };

    /**
     * @return {Array|null}
     */
    Package.prototype.getDependenciesNames = function () {
        if (this._dependencies) {
            return Object.keys(this._dependencies);
        } else {
            return null;
        }
    };

    /**
     * @return {number}
     */
    Package.prototype.dependenciesCount = function () {
        if (this._dependencies) {
            return Object.keys(this._dependencies).length;
        } else {
            return 0;
        }
    };

    /**
     * @param {string} name
     */
    Package.prototype.addDependant = function (name) {
        if (!this.hasDependant()) {
            this._dependants.push(name);
        }
    };

    /**
     * @param {string} name
     */
    Package.prototype.removeDependant = function (name) {
        if (this.hasDependant(name)) {
            this._dependants.slice(name); // TODO review
        }
    };

    /**
     * @return {boolean}
     */
    Package.prototype.hasDependants = function () {
        return (this.dependantsCount() !== 0);
    };

    /**
     * @return {boolean}
     */
    Package.prototype.hasDependant = function (name) {
        return (this._dependants.indexOf(name) !== -1);
    };

    /**
     * @return {number}
     */
    Package.prototype.dependantsCount = function () {
        return this._dependants.length;
    };

    /**
     * Check if the current package version has latest versions.
     * @return {boolean} isLatest True if it has latest version, otherwhise, false.
     */
    Package.prototype.hasUpdates = function () {
        if (!this._version || !this._latestVersion) {
            return false;
        }

        var current = this._version.split("."),
            latest = this._latestVersion.split("."),
            hasLatest = false;

        current.some(function (value, index) {
            var numberValue = parseInt(value, 0),
                numberLatest = parseInt(latest[index], 0);

            hasLatest = (numberLatest > numberValue);

            return hasLatest;
        });

        return hasLatest;
    };

    /**
     * Check if the current installed version is in sync with the defined version in
     * the bower.json if any.
     * @return {boolean} True if is in sync or any bower.json is available, otherwhise false.
     */
    Package.prototype.isVersionInSync = function () {
        var isInSync;

        if (this._version !== null && this._bowerJsonVersion !== null &&
                semver.validRange(this._bowerJsonVersion) !== null) {

            isInSync = semver.satisfies(this._version, this._bowerJsonVersion);
        } else {

            isInSync = true;
        }

        return isInSync;
    };

    /**
     * @param {object} packageInfo
     */
    Package.prototype.updateVersionInfo = function (packageInfo) {
        if (!packageInfo || !packageInfo.latestVersion) {
            return;
        }

        this._latestVersion = packageInfo.latestVersion;
    };

    /**
     * @return {boolean}
     */
    Package.prototype.isDevDependency = function () {
        return (this._dependencyType === DependencyType.DEVELOPMENT);
    };

    /**
     * @return {boolean}
     */
    Package.prototype.isProductionDependency = function () {
        return (this._dependencyType === DependencyType.PRODUCTION);
    };

    /**
     * Check if the package is installed. An installed package is the one that is
     * tracked and installed, and also extraneous.
     * @return {boolean}
     */
    Package.prototype.isInstalled = function () {
        return (this._status !== PackageUtils.Status.MISSING);
    };

    /**
     * @return {boolean}
     */
    Package.prototype.isMissing = function () {
        return (this._status === PackageUtils.Status.MISSING);
    };

    /**
     * @return {boolean}
     */
    Package.prototype.isNotTracked = function () {
        // bower "extraneous" definition
        return (this._status === PackageUtils.Status.NOT_TRACKED);
    };

    /**
     * @param {Package} pkg
     */
    Package.prototype.isEqualTo = function (pkg) {
        return (this._dependencyType === pkg.dependencyType &&
                this._status === pkg.status &&
                this._bowerJsonVersion === pkg.bowerJsonVersion);
    };

    /**
     * Check if the given dependency name is defined in bower json dependencies.
     * @param {string} name
     * @param {object} bowerJsonDependencies
     */
    Package.isInBowerJsonDeps = function (name, bowerJsonDependencies) {
        if (!bowerJsonDependencies) {
            return false;
        }

        if (bowerJsonDependencies.dependencies &&
                bowerJsonDependencies.dependencies[name]) {
            return true;
        }

        if (bowerJsonDependencies.devDependencies &&
                bowerJsonDependencies.devDependencies[name]) {
            return true;
        }

        return false;
    };

    Package.isProjectDirectDependency = function (name, status, bowerJsonDeps) {
        var isDirectDependency;

        if (status !==  PackageUtils.Status.INSTALLED) { // missing or extraneous
            isDirectDependency = true;
        } else {
            isDirectDependency = (bowerJsonDeps) ? Package.isInBowerJsonDeps(name, bowerJsonDeps) : true;
        }

        return isDirectDependency;
    };

    module.exports = Package;
});
