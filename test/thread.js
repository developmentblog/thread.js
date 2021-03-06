var expect = chai.expect

describe('thread', function () {

  function defer(fn, ms) { setTimeout(fn, 1) }

  describe('api', function () {
    it('should expose the thread factory', function () {
      expect(thread).to.be.a('function')
    })

    it('should expose the thread object', function () {
      expect(thread.Thread).to.be.a('function')
    })

    it('should expose the Task constructor', function () {
      expect(thread.Task).to.be.a('function')
    })

    it('should expose the version property', function () {
      expect(thread.VERSION).to.be.a('string')
    })
  })

  describe('sum numbers synchronously', function () {
    var task, worker = thread()

    it('should run a task', function () {
      task = worker.run(function () {
        return 2 + 2
      })
    })

    it('should have a valid result', function (done) {
      task.then(function (num) {
        expect(num).to.be.equal(4)
        done()
      })
    })
  })

  describe('sum numbers synchronously passing a context', function () {
    var task = null
    var worker = thread({
      env: { x: 2 }
    })

    it('should run a task', function () {
      task = worker.run(function () {
        return env.x + 2
      })
    })

    it('should have a valid result', function (done) {
      task.then(function (num) {
        expect(num).to.be.equal(4)
        done()
      })
    })
  })

  describe('sum numbers asynchronously passing a context with custom namespace', function () {
    var task = null
    var worker = thread({
      namespace: 'global',
      env: { x: 2 }
    })

    it('should run a task', function () {
      task = worker.run(function (done) {
        setTimeout(function () {
          done(null, global.x * 2)
        }, 50)
      })
    })

    it('should have a valid result', function (done) {
      task.then(function (num) {
        expect(num).to.be.equal(4)
        done()
      })
    })
  })

  describe('pass an error synchronously', function () {
    var task = null
    var worker = thread({
      env: { error: true }
    })

    it('should run a task', function (done) {
      task = worker.run(function () {
        throw 'error'
      }).finally(function () { done() })
    })

    it('should have a valid result', function (done) {
      task.catch(function (err) {
        expect(err.message).to.be.equal('error')
        done()
      })
    })
  })

  describe('pass an error asynchronously', function () {
    var task = null
    var worker = thread({
      env: { error: true }
    })

    it('should run a task', function (done) {
      task = worker.run(function (done) {
        setTimeout(function () {
          if (env.error) {
            done('message')
          }
        }, 50)
      }).finally(function () { done() })
    })

    it('should have a valid result', function (done) {
      task.catch(function (err) {
        expect(err.message).to.be.equal('message')
        done()
      })
    })
  })

  describe('import external script', function () {
    var task = null
    var worker = thread({
      require: ['http://cdn.rawgit.com/h2non/hu/0.1.1/hu.js']
    })

    it('should run a task', function () {
      task = worker.run(function () {
        return hu.reverse('hello')
      })
    })

    it('should have a valid result', function (done) {
      task.then(function (value) {
        expect(value).to.be.equal('olleh')
        done()
      })
    })
  })

  describe('import external script as string', function () {
    var task = null
    var worker = thread({
      require: 'http://cdn.rawgit.com/h2non/hu/0.1.1/hu.js'
    })

    it('should run a task', function () {
      task = worker.run(function () {
        return hu.reverse('hello')
      })
    })

    it('should have a valid result', function (done) {
      task.then(function (value) {
        expect(value).to.be.equal('olleh')
        done()
      })
    })
  })

  describe('pass function as require context', function () {
    var task = null
    var worker = thread({
      env: {
        x: 2
      },
      require: {
        defer: defer
      }
    })

    it('should run a task', function () {
      task = worker.run(function (done) {
        var y = this.y
        return env.defer(function () {
          done(null, env.x * y)
        })
      }, { y: 2 })
    })

    it('should have a valid result', function (done) {
      task.then(function (value) {
        expect(value).to.be.equal(4)
        done()
      })
    })
  })

  describe('pass function to worker via require', function () {
    var task = null
    var worker = thread({
      env: { x: 2 }
    }).require('defer', defer)

    it('should run a task', function () {
      task = worker.run(function (done) {
        var y = this.y
        return env.defer(function () {
          done(null, env.x * y)
        })
      }, { y: 2 })
    })

    it('should have a valid result', function (done) {
      task.then(function (value) {
        expect(value).to.be.equal(4)
        done()
      })
    })
  })

  describe('bind aditional context to the task', function () {
    var task = null
    var worker = thread({
      env: { x: 2 }
    })

    it('should run a task', function () {
      task = worker.run(function () {
        return env.x * this.y
      }, { y: 2 })
    })

    it('should have a valid result', function (done) {
      task.then(function (value) {
        expect(value).to.be.equal(4)
        done()
      })
    })

    it('should not exists the y context variable', function (done) {
      worker.run(function () {
        return typeof this.y
      }).then(function (value) {
        expect(value).to.be.equal('undefined')
        done()
      })
    })
  })

  describe('passing arguments to the task', function () {
    var task = null
    var worker = thread({
      env: { x: 2 }
    })

    it('should run a task', function () {
      task = worker.run(function (num) {
        return env.x * this.y * num
      }, { y: 2 }, [2])
    })

    it('should have a valid result', function (done) {
      task.then(function (value) {
        expect(value).to.be.equal(8)
        done()
      })
    })
  })

  describe('passing arguments to the asynchronous task', function () {
    var task = null
    var worker = thread({
      env: { x: 2 }
    })

    it('should run a task', function () {
      task = worker.run(function (num, done) {
        done(null, env.x * this.y * num)
      }, { y: 2 }, [2])
    })

    it('should have a valid result', function (done) {
      task.then(function (value) {
        expect(value).to.be.equal(8)
        done()
      })
    })
  })

  describe('idle time', function () {
    var task = null
    var worker = thread()
    worker.idleTime = 100

    it('should run a task', function () {
      task = worker.run(function () {
        return 4 * 2
      })
    })

    it('should have a idle state', function (done) {
      task.then(function () {
        setTimeout(function () {
          expect(worker.idle()).to.be.true
          done()
        }, 150)
      })
    })
  })

  describe('task compute time exceeded error', function () {
    var task = null
    var worker = thread()
    worker.maxTaskDelay = 300

    it('should run a task', function () {
      task = worker.run(function (done) {
        setTimeout(done, 500)
      })
    })

    it('should have a valid result', function (done) {
      task.catch(function (err) {
        expect(err.message).to.be.equal('maximum task execution time exceeded')
        done()
      })
    })
  })

  describe('number of running tasks', function () {
    var task = null
    var worker = thread()

    it('should run multiple tasks', function () {
      worker.run(function (done) {
        setTimeout(done, 200)
      })
      worker.run(function (done) {
        setTimeout(done, 400)
      })
    })

    it('should have a valid number of tasks', function () {
      expect(worker.pending()).to.be.equal(2)
    })

    it('should be running', function () {
      expect(worker.running()).to.be.true
    })

    it('should be running when are not yet finished', function (done) {
      setTimeout(function () {
        expect(worker.pending()).to.be.equal(1)
        expect(worker.running()).to.be.true
        done()
      }, 300)
    })

    it('should kill the thread', function () {
      worker.kill()
    })

    it('should be as terminated state', function () {
      expect(worker.terminated).to.be.true
    })
  })

})
