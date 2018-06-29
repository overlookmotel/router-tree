/* --------------------
 * router-tree module
 * List files in folder recursively
 * ------------------*/

'use strict';

// Modules
const fs = require('fs');

// Imports
const {pushArray} = require('./utils');

// Exports
class Scanner {
	constructor(path, options) {
		this.path = path;

		this.filterFiles = options.filterFiles;
		this.filterFolders = options.filterFolders;
		this.max = options.maxConcurrent || 5;

		this.paths = [];
		this.scanQueue = [];
		this.statQueue = [];
		this.numRunning = 0;
		this.numQueued = 0;
		this.hasErrored = false;

		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	scan(path) {
		this.scanQueue.push(path);
		this.numQueued++;
		this.doNext();
	}

	stat(arr) {
		pushArray(this.statQueue, arr);
		this.numQueued += arr.length;

		for (let i = 0; i < arr.length; i++) {
			const again = this.doNext();
			if (!again) break;
		}
	}

	doNext() {
		if (this.hasErrored || this.numQueued == 0 || this.numRunning >= this.max) return false;

		const {statQueue, scanQueue} = this;
		if (statQueue.length > 0) {
			const {path, filename} = statQueue.shift();
			this.doStat(path, filename);
		} else {
			const path = scanQueue.shift();
			this.doScan(path);
		}

		this.numQueued--;
		this.numRunning++;

		return true;
	}

	doStat(path, filename) {
		const filePath = `${path}${filename}`;
		fs.stat(`${this.path}${filePath}`, (err, stat) => {
			if (err) return this.errored(err);

			if (stat.isDirectory()) {
				if (this.filterFolders(filename)) this.scan(`${filePath}/`);
			} else {
				if (this.filterFiles(filename)) this.paths.push(filePath);
			}

			this.doneOne();
		});
	}

	doScan(path) {
		fs.readdir(`${this.path}${path}`, (err, files) => {
			if (err) return this.errored(err);
			this.stat(files.map(filename => ({path, filename})));
			this.doneOne();
		});
	}

	doneOne() {
		this.numRunning--;
		if (!this.hasErrored && this.numRunning == 0 && this.numQueued == 0) return this.done();

		this.doNext();
	}

	done() {
		this.resolve(this.paths);
	}

	errored(err) {
		this.hasErrored = true;
		this.reject(err);
	}
}

/**
 * Asyncronously recursively scan a tree of files and return array of paths
 *
 * @param {string} path - Folder path to scan (without trailing '/')
 * @param {Object} options - Options object
 * @param {Function|RegExp} [options.filterFiles] - Function/Regexp to filter files with
 * @param {Function|RegExp} [options.filterFolders] - Function/Regexp to filter folders with
 * @param {number} [options.maxConcurrent] - Max concurrent file operations (default 5)
 * @returns {Promise} - Array of paths found (paths relative to initial path)
 */
module.exports = function(path, options) {
	const scanner = new Scanner(path, options);
	scanner.scan('/');
	return scanner.promise;
};
