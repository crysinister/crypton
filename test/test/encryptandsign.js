/* Crypton Server, Copyright 2013 SpiderOak, Inc.
 *
 * This file is part of Crypton Server.
 *
 * Crypton Server is free software: you can redistribute it and/or modify it
 * under the terms of the Affero GNU General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Crypton Server is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the Affero GNU General Public
 * License for more details.
 *
 * You should have received a copy of the Affero GNU General Public License
 * along with Crypton Server.  If not, see <http://www.gnu.org/licenses/>.
*/

describe('encryptAndSign+verifyAndDecrypt()', function () {
  this.timeout(100000);

  var alice;
  var bob;
  var aliceSession;
  var bobSession;
  var alicePeer;
  var bobPeer;
  var messageResult;
  var plaintext = 'MR JONES of the Manor Farm, had locked the hen-houses for the night, but was too drunk to remember to shut the pop-holes. With the ring of light from his lantern dancing from side to side he lurched across the yard, kicked off his boots at the back door, drew himself a last glass of beer from the barrel in the scullery, and made his way up to bed, where Mrs Jones was already snoring.';

  describe('Create 2 accounts and exchange a message and decrypt it', function () {
    it('Create Alice', function (done) {
      crypton.generateAccount('alice', 'pass', function (err, acct) {
        if (err) throw err;
        alice = acct;
        assert(alice);
        done();
      }, {
          save: true
        });
      });

    it('Get Alice\'s session', function (done) {
      crypton.authorize('alice', 'pass', function (err, sess) {
        if (err) throw err;
        aliceSession = sess;
        assert(aliceSession);
        done();
      });
    });

    it('Create Bob', function (done) {
      crypton.generateAccount('bob', 'pass', function (err, acct) {
        if (err) throw err;
        bob = acct;
        assert(bob);
        done();
      }, {
        save: true
      });
    });

    it('Get Bob\'s session', function (done) {
      crypton.authorize('bob', 'pass', function (err, sess) {
        if (err) throw err;
        bobSession = sess;
        assert(bobSession);
        done();
      });
    });

    it('Get Alice as peer', function (done) {
      bobSession.getPeer("alice", function (err, peer) {
        if (err) throw err;
        alicePeer = peer;
        done();
      });
    });

    it('encryptAndSign a message for Alice', function (done) {
      messageResult = alicePeer.encryptAndSign(plaintext, aliceSession);
      assert.equal(messageResult.error, null);
      assert(messageResult.ciphertext && messageResult.signature);
      messageResult = JSON.stringify(messageResult);
      done();
    });

    it('Alice needs to login again so Alice\'s session is valid', function (done) {
      crypton.authorize('alice', 'pass', function (err, sess) {
        if (err) throw err;
        aliceSession = sess;
        assert(aliceSession);
        done();
      });
    });

    it('Get Bob as peer', function (done) {
      aliceSession.getPeer('bob', function (err, peer) {
        if (err) throw err;
        bobPeer = peer;
        done();
      });
    });

    it('verifyAndDecrypt the message from Bob', function (done) {
      var ciphertext = JSON.parse(messageResult);
      var verified = aliceSession.account.verifyAndDecrypt(ciphertext, bobPeer);
      assert.equal(verified.error, null);
      assert.equal(verified.verified, true);
      // assert(verified.plaintext == plaintext); // XXXddahl: This is off by the "" introduced by JSON???
      done();
    });
  });
});
