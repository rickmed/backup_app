const {execFile} = require('child_process')
const {mkdir, rmdir} = require('fs')

const __execCB = rmdir => (mountPath, cb) => (err, stdout, stderr) => {
  if (err) {
    console.log(err)
    rmdir(mountPath, e => {
      if (e) {
        e.mount = 'Remove mountPath failed on cleanup'
        cb(e)
      }
    })
  }
  else cb(null, mountPath)
}

const execCB = __execCB(rmdir)


const __mount = (execFile, mkdir) =>
  /**
  * @function mount
  * @param  {string} devName
  * @param  {function(Error, string): void} cb string is mountPath
  */
  (devName, cb) => {
  const reTryIfDirExist = num => {
    const mountPath = `/tmp/${devName}-${num}`
    mkdir(mountPath, err => {
      if (num === 5) {
        const e = new Error(`Failed after trying to create mounting dirs with ${num} different names`)
        cb(e)
      }
      else if (err && err.code === 'EEXIST') {
        reTryIfDirExist(num + 1)
      }
      else if (err) cb(err)
      else execFile(
        `mount`,
        [`/dev/${devName}`, mountPath],
        execCB(mountPath, cb)
      )
    })
  }
  reTryIfDirExist(1)
}

const mount = __mount(execFile, mkdir)

const __umount = (execFile, rmdir) =>
  /**
  * @function umount
  * @param  {string} partName
  * @return  {function(string): function(function(Error): any)): void}
  */
  partName => mountedPath => cb => {
    execFile( `umount`, [`/dev/${partName}`],
      (err, stdout, stderr) => {
        const cbErr = err || stderr
        if (cbErr) cb(cbErr)
        else {
        // auto double check bc if dev still mounted, rmdir will fail
          rmdir(mountedPath, err => cb(err))
        }
      }
    )
  }

const umount = __umount(execFile, rmdir)

module.exports = {__execCB, mount, __mount, umount, __umount}