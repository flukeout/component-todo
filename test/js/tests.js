(function () {
  var counterElement;
  var iframeHandler;

  mocha.setup('bdd');
  chai.should();

  beforeEach(function (done) {
    iframeHandler = harnessUtils.createIframe('test/html/test.html', function (win, doc) {
      counterElement = iframeHandler.document.querySelector('ceci-counter');
      counterElement.increment = 1;
      counterElement.value = 3;
      done();
    });
  });

  // These tests use blue and red channels to count up and down respectively.

  describe('Ceci Counter', function () {

    describe('basic math', function () {
      it('increment should add 1', function (done) {
        counterElement.value.should.equal(3);
        iframeHandler.broadcast('blue');
        counterElement.value.should.equal(4);
        done();
      });

      it('decrement twice should remove 2', function (done) {
        counterElement.value.should.equal(3);
        iframeHandler.broadcast('red');
        iframeHandler.broadcast('red');
        counterElement.value.should.equal(1);
        done();
      });
    });

    describe('negative value', function () {
      it('increment by -10 should remove 10', function () {
        counterElement.increment = -10;
        counterElement.value.should.equal(3);
        iframeHandler.broadcast('blue');
        counterElement.value.should.equal(-7);
      });

      it('decrement by -10 should add 10', function () {
        counterElement.value.should.equal(3);
        counterElement.increment = -10;
        iframeHandler.broadcast('red');
        counterElement.value.should.equal(13);
      });
    });

    describe('ui changes', function() {
      it('valueChanged should update the count', function (done) {
        counterElement.value = 12;
        // `valueChanged` is executed async
        setTimeout(function() {
          try {
            counterElement.$.value.innerHTML.should.eq('12');
          }catch (e) {
            done(e.message);
          }
          done();
        }, 200);
      });

      it('unitChanged should update the label', function (done) {
        counterElement.value = 1;
        counterElement.unit = 'peanut';
        // `unitChanged` is executed async
        setTimeout(function() {
          try {
            counterElement.$.unit.innerHTML.should.eq(' peanut');
          }catch (e) {
            done(e.message);
          }
          done();
        }, 200);
      });

      it('unitChanged should update the label and pluralize it', function (done) {
        counterElement.unit = 'peanut';
        // `unitChanged` is executed async
        setTimeout(function() {
          try {
            counterElement.$.unit.innerHTML.should.eq(' peanuts');
          }catch (e) {
            done(e.message);
          }
          done();
        }, 200);
      });
    });
  });
})();
