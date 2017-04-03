angular.module('services', [])

// This factory check the http response, and redirect if needed
  .factory('responseObserver', function responseObserver($q, $window) {
    return {
      responseError: function (errorResponse) {
        switch (errorResponse.status) {
          case 403:
            $window.location = '/#/login';
            break;
        }
        return $q.reject(errorResponse);
      }
    };
  })

  .factory('UtilitiesService', function responseObserver($q, $window, $cordovaFile, $translate, $http, server, clientVersion, $ionicPopup, UserService) {
    var logName = "user_log.txt";//localStorage.getItem("logName");
    console.log("logName: "+ logName);
    return {

      speak : function(text) {
        console.log("UtilitiesService speak : "+ text);
        if (typeof TTS != 'undefined'){
      TTS.speak({
        text: text,
        locale: 'en-US',
        rate: 1.5
      }, function () {
      }, function (reason) {
        console.log("DEBUG", '>speak FAIL'+ reason);
      });
        }
    },

      getNotifName : function(arr,type,nameType)
      {
        var count=0;
        var alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
        var nato = ['Alfa','Bravo','Charlie','Delta','Echo','Foxtrot','Golf','Hotel','India','Juliet','Kilo','Lima','Mike','November','Oscar','Papa','Quebec','Romeo','Sierra','Tango','Uniform','Victor','Whiskey','Xray','Yankee','Zulu']
        for (i = 0; i < arr.length; i++) {
          if (arr[i].messageObject[0].type == type) count++;
        }
        if(nameType=="alpha"){
          return alphabet[count];
        }else if (nameType=="radio"){
          return nato[count];
        } else{
          return count;
        }

      },

      createlog : function(){
        console.log("Log Creation");
        if (typeof $cordovaFile != 'undefined' ) {
          $cordovaFile.writeFile(cordova.file.dataDirectory, logName, "- START SESSION"+Date.now()+" -\n", true)
            .then(
              function (success) {
                console.log("Log created: " + success);
              },
              function (error) {
                console.log("Log creation error: " + error);
              })
        };
      },
      log: function (type, value) {
        /* type:
         ENTERPAGE
         SERVICEDEBUG
         DEBUG
         ACTION (generic button click)
         ACTIVITY
         PLAYACTIVITY
         CREATEACTIVITY
         FINISHACTIVITY
         SAVEACTIVITY
         MARKET
         BUY
         SHARE
         ERROR
         NOTIFICATION
         PUBLISH
         LOGIN
         SETTINGS
         CREATEACCOUNT
         BLECONNECT
         VERSION
         */
        if (type != "" ) {

          console.log("== " + type + " | value: " + value);

          if (typeof cordova != 'undefined' ){
            //console.log ('$cordovaFile  found: '+ cordova);
          $cordovaFile.checkFile(cordova.file.dataDirectory, logName).then(
            function (success) {
              //console.log ("checkFile succes: "+success);
            },
            function (error){
              //console.log ("checkFile error: "+error);
              $cordovaFile.createFile(cordova.file.dataDirectory,logName, true)
                .then(
                function (success) {
                  //console.log ("createFile  succes: "+success);
                },
                function (error){
                  //console.log ("createFile  error: "+error);
                });
;
            });

            //$cordovaFile.createFile(cordova.file.dataDirectory, true);
          $cordovaFile.writeExistingFile(cordova.file.dataDirectory,logName, ">  " + type + " \t|\t value: " + value+" \t|\t " +new Date() +"\n", true)
            .then(
              function (success) {
                //console.log ("Log append succes: "+success);
              },
              function (error){
               // console.log ("Log append error: "+error);
              })
        }else{
            //console.log ('cordova not found');
          }
        }
      },

      scaleDataLog: function (data, scaleFactor) {
        var dataOut = new Array();
        //var dataIn = new Array();
        var increment = 1;
        var counter = 0;
        dataIn = data;
        if (dataIn.length > scaleFactor) {
          increment = Math.floor(dataIn.length / scaleFactor);
        }
        console.log(">scaleDataLog(" + scaleFactor + ") - " + increment);

        dataIn.forEach(function (element, index, array) {
          counter++;
          if (counter == increment) {
            dataOut.push({
              lat: dataIn[index].coords.lat,
              lng: dataIn[index].coords.lng,
              timestamp: dataIn[index].timestamp,
              speed: dataIn[index].speed,
              altitude: dataIn[index].altitude,
              power: dataIn[index].power
            });
            counter = 0;
          }
        }, this);

        // for (i=0; i>dataIn.length;i+=increment){
        //   dataOut.push({
        //     // lat: data[i].coords.lat(),
        //     // lng: data[i].coords.lng(),
        //     // timestamp: data[i].timestamp,
        //     // speed: data[i].speed,
        //     // altitude: data[i].altitude
        //   });
        // }
        return dataOut;
      },

      checkVersion: function () {
        this.log("VERSION", clientVersion);

        // Request the server to compare version
        $http.post(server.url + ":" + server.port + '/checkVersion', {clientVersion: clientVersion}).then(
          function (response) {
            console.log(" success " + response);
          }, function (response) {
            console.log(" fail" + JSON.stringify(response));
              $ionicPopup.show({
                  title: $translate.instant(response.data.title),
                  template: response.data.message,
                  buttons: response.data.buttons
              });

          }
        );
      },

      enableBgMode: function () {
        // document.addEventListener('deviceready', function () {
        //   // Android customization
        //   cordova.plugins.backgroundMode.setDefaults({text: 'Doing heavy tasks.'});
        //   // Enable background mode
        //   cordova.plugins.backgroundMode.enable();

        //   // Called when background mode has been activated
        //   cordova.plugins.backgroundMode.onactivate = function () {
        //     setTimeout(function () {
        //       // Modify the currently displayed notification
        //       cordova.plugins.backgroundMode.configure({
        //         text: 'Running in background for more than 5s now.'
        //       });
        //     }, 5000);
        //   }
        // }, false);
      },


      convertTimeStamp: function (timestamp) {
        var theDate = new Date(timestamp * 1000);
        dateString = theDate.toGMTString();
        alert(dateString);
      },

      sendInvite: function(inviteEmail, userName, userEmail, successFct, errorFct) {
        console.log(" >service sendEmail() "+ inviteEmail, userName, userEmail);
        // Request the server to try to add the user
        $http.post(server.url + ":" + server.port + '/sendInvite', {inviteEmail:inviteEmail, userName:userName, userEmail:userEmail}).then(
          function(response) {
            successFct(response);
          }, function(response) {
            errorFct(response);
          }
        );
      },
      sendBug: function(filepath, filename, userBug, ionicDevice, userEmail, userName, successFct, errorFct) {
        console.log(" >service sendBug() "+ userBug, userName, userEmail, ionicDevice);
        $cordovaFile.checkFile(filepath, filename).then(function(success) {
          console.log("File exist!!!!!");
          $cordovaFile.readAsText(filepath, filename).then(function(debugLog) {
            var fileContent = debugLog;
            // Request the server to try send bug to email
            $http.post(server.url + ":" + server.port + '/sendBug', {userBug:userBug, userName:userName, fileContent: fileContent, userEmail:userEmail, ionicDevice:ionicDevice}).then(
              function(response) {
                successFct(response);
              }, function(response) {
                errorFct(response);
              }
            );
          }, function(error) {
            $http.post(server.url + ":" + server.port + '/sendBug').then(
              function(response) {
                successFct(response);
              }, function(response) {
                errorFct(response);
              }
            );
            console.log("The file could not be read.");
          })
        }, function(error) {
          $http.post(server.url + ":" + server.port + '/sendBug').then(
            function(response) {
              successFct(response);
            }, function(response) {
              errorFct(response);
            }
          );
          console.log("File does not exist in NoCloud!!");
        })
      },

      convertTime: function (clock) {

        if (clock) {
          seconds = Math.floor((clock / 1000) % 60);
          minutes = Math.floor((clock / 60000) % 60);
          hours = Math.floor((clock / 3600000) % 24);

          var output = "";

          if (hours < 10) {
            hours = "0" + hours;
          }
          if (minutes < 10) {
            minutes = "0" + minutes;
          }
          if (seconds < 10) {
            seconds = "0" + seconds;
          }
          if (hours != "00") output = hours + "h";
          if (minutes != "00" || hours != "00") output += minutes + "m";
          if (seconds != "00") output += seconds + "s";
          return output;
        } else {
          return;
        }
      },

      convertTimeHMS: function (clock, style) {

        if (clock) {
          seconds = Math.floor((clock / 1000) % 60);
          minutes = Math.floor((clock / 60000) % 60);
          hours = Math.floor((clock / 3600000) % 24);

          var output = "";

          if (hours < 10) {
            hours = "0" + hours;
          }
          if (minutes < 10) {
            minutes = "0" + minutes;
          }
          if (seconds < 10) {
            seconds = "0" + seconds;
          }
          if (style == 1) {
            // 3m21s
            output = hours + "h";
            output += minutes + "m";
            output += seconds + "s";
          }
          if (style == 2) {
            //00h063m21s
            if (hours != "00") output = hours + "h";
            if (minutes != "00" || hours != "00") output += minutes + "m";
            if (seconds != "00") output += seconds + "s";
          }
          if (style == 3) {
            //00:00:00
            output = hours + ":";
            output += minutes + ":";
            output += seconds + "";
          }
          return output;
        } else {
          return;
        }
      }
    };

  })


  //bluetooth service for arduino
  .factory('BLE', function ($q, $ionicPlatform, $ionicPopup, $rootScope) {

    var connected;

    return {

      devices: [],

      bluefruit: {
        serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
        txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
        rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
      },

      bytesToString: function (buffer) {
        return String.fromCharCode.apply(null, new Uint8Array(buffer));
      },

      scan: function () {
        var that = this;
        var deferred = $q.defer();

        that.devices.length = 0;

        // disconnect the connected device (hack, device should disconnect when leaving detail page)
        if (connected) {
          var id = connected.id;
          ble.disconnect(connected.id, function () {
            console.log("Disconnected " + id);
          });
          connected = null;
        }

        ble.startScan([], /* scan for all services */
          function (peripheral) {
            //if(  $.inArray(peripheral, that.devices) == -1 ) { //check for duplicates
            that.devices.push(peripheral);
            //}
          },
          function (error) {
            deferred.reject(error);
          });

        // stop scan after 5 seconds
        setTimeout(ble.stopScan, 5000,
          function () {
            deferred.resolve();
          },
          function () {
            console.log("stopScan failed");
            deferred.reject("Error stopping scan");
          }
        );

        return deferred.promise;
      },

      connect: function (deviceId) {
        var deferred = $q.defer();

        ble.connect(deviceId,
          function (peripheral) {
            connected = peripheral;
            console.log('yay!');
            deferred.resolve(peripheral);

          },
          function (reason) {
            console.log('FangHuoChangCheng says NO!!!!!!');
            deferred.reject(reason);
          }
        );

        return deferred.promise;
      },

      disconnect: function (deviceID) {
        ble.disconnect(deviceID, function () {
          console.log("Disconnected " + deviceID);
        });
      },

      init: function (userChoice) {
        if (userChoice) {
          ble.isEnabled(
            //It is turned on
            function (success) {
              console.log("Bluetooth is enabled, nothing to do...");
            },
            //It is NOT turned on
            function (fail) {
              if (ionic.Platform.isIOS()) {
                console.log('This is an IOS Device');

                var confirmPopup = $ionicPopup.confirm({
                    title: 'Bluetooth is turned off',
                    template: 'Your BLuetooth is turned off. Do you want to turn it on?'
                  }
                ).then(function (response) {
                  //if user said No
                  if (!response) {
                    return false;
                  } else {
                    return true;
                  }//.then inner else

                }); //end of .then for confirmPopup
              } else if (ionic.Platform.isAndroid()) {
                console.log('This is an Android Device');
                ble.enable(
                  //success
                  function (success) {
                    console.log(success);
                    return true;
                  },
                  //fail
                  function (fail) {
                    console.log(fail);
                    return false;
                  });

              } else {
                console.log('This is a computer browser');
                return false;
              }//else for checking platforms
            }//ble.isEnabled Fail
          ); //ble.isEnabled
        } else {
          console.log('The user was asked and decided not to turn on the bluetooth for this activity');
        }

      },//end of init

      sendData: function (deviceID, message) {
        var data = stringToBytes(message);
        console.log(data);

        ble.write(
          deviceID,
          bluefruit.serviceUUID,
          bluefruit.txCharacteristic,
          data,
          function () {
            console.log('success');
          },
          function () {
            console.log('FangHuoChangCheng says NO!!!!!!');
          }
        );
      },//end of sendData

      getNotificationBLE: function (deviceID) {
        ble.startNotification(
          deviceID,
          bluefruit.serviceUUID,
          bluefruit.rxCharacteristic,
          function (success_buffer) {
            console.log('message received from: ' + deviceID);
            console.log(success_buffer);

            var msg = String.fromCharCode.apply(null, new Uint8Array(success_buffer))
            console.log(msg);
            $rootScope.$broadcast('GetNotifEvent', {
              value: msg
            });
            return success_buffer;
          },
          function (error_buffer) {
            console.log('error on message reception');
            console.log(error_buffer);
            return null;
          });
      },//end of getNotificationBLE


      testTagEvent: function (deviceID) {
        console.log("testTagEvent");
        $rootScope.$broadcast('GetNotifEvent', {
          value: 'TAG'
        });
      }//end of getNotificationBLE


    };
  })

  // This factory is used to read and write in the offline data file
  .factory('FileService', function ($cordovaFile, offlineDataFile) {

    // Contains the file content
    var data = null;

    return {
      // Write in the file the content of 'data' variable
      writeData: function (newData) {
        if (typeof cordova == "undefined")
          return;
        $cordovaFile.writeFile(cordova.file.dataDirectory, offlineDataFile, JSON.stringify(newData), true).then(function (result) {
          // Success
          data = newData;
        }, function (error) {
          // Error
        });
      },
      // Returns the file content
      getData: function () {
        return data;
      },
      // Reset the data
      resetData: function () {
        data = null;
      },
      // Read in the file to get the content
      getDataInFile: function (doneFct) {
        if (typeof cordova == "undefined") {
          doneFct();
          return;
        }
        $cordovaFile.readAsText(cordova.file.dataDirectory, offlineDataFile).then(function (result) {
          // Success
          data = JSON.parse(result);
          doneFct();
        }, function (error) {
          // Error
          doneFct();
        });
      },
      uploadToS3: function (filename, type, successFct,errorFct) {
        console.log("cordova.file.dataDirectory: " + cordova.file.dataDirectory);
        s3Uploader.upload(cordova.file.dataDirectory + "/" + filename, filename, type)
          .done(function () {
            successFct();
           // alert("S3 upload succeeded");
          })
          .fail(function () {
            errorFct();
            alert("S3 upload failed");
          });
      }




    };
  })

  // This factory is used to display popups
  .factory('PopupService', function ($ionicPopup, $translate) {
    return {
      // Display a 'OK' popup with the title and message passed in parameters
      showAlert: function (title, message) {
        var alertPopup = $ionicPopup.alert({
          title: title,
          template: message
        });
      },
      // Display a "Yes/No" popup and run the good function depending of the user's response
      showConfirm: function (title, message, noFct, yesFct) {
        var confirmPopup = $ionicPopup.confirm({
          title: title,
          template: message,
          cancelText: $translate.instant('UTILS.No'),
          okText: $translate.instant('UTILS.Yes')
        });

        // If the user pressed Yes, we run the yesFct()
        // else we run the noFct()
        confirmPopup.then(function (res) {
          if (res)
            yesFct();
          else
            noFct();
        });
      }
    };
  })

  .factory('MapService', function () {

    var startImg = {
      url: 'img/gps_marker_start.png',
      // This marker is 20 pixels wide by 32 pixels high.
      scaledSize: new google.maps.Size(50, 50),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(25, 50)
    };

    // Final marker image
    var finishImg = {
      url: 'img/gps_marker_finish.png',
      // This marker is 20 pixels wide by 32 pixels high.
      scaledSize: new google.maps.Size(50, 50),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(25, 50)
    };

    //Other markers
    var notifImg = {
      url: 'img/gps_marker.png',
      // This marker is 20 pixels wide by 32 pixels high.
      scaledSize: new google.maps.Size(50, 50),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(25, 50)
    };
    var maptype= "road";

    return {
      getstartImg: function(){
        return startImg;
      },
      getfinishImg: function(){
        return finishImg;
      },
      getnotifImg: function(){
        return notifImg;
      },
      getMap: function(map_canvas_id){
        var map = plugin.google.maps.Map.getMap(document.getElementById(map_canvas_id), {
          'mapType': plugin.google.maps.MapTypeId.ROADMAP,
          'controls': {
            'compass': true,
            'indoorPicker': true,
            'zoom': true
          },
          'gestures': {
            'scroll': true,
            'tilt': true,
            'rotate': true,
            'zoom': true
          }
        });
        this.mapType ="road";
        return map;
      },

      toggleMapType: function(map){
        console.log("toggleMapType: "+ mapType);
        if (this.mapType =="satellite"){
          this.mapType ="road";
        map.setMapTypeId(plugin.google.maps.MapTypeId.ROADMAP);
        }else{
          this.mapType ="satellite";
          map.setMapTypeId(plugin.google.maps.MapTypeId.HYBRID);
        }
      },

      setMarkerType: function(map, position, type) {
        var url = 'img/gps_marker.png';
        switch(type) {
          case 'finish':
            url = 'img/gps_marker_finish.png';
            break;
          case 'start':
            url = 'img/gps_marker_start.png';
            break;
          default:
            url = 'img/gps_marker.png';
        }
        map.addMarker({
          'position': position
        }, function(marker) {
          marker.setIcon({
            'url': url,
            'size': {
              width: 40,
              height: 55
            }
          }),
            marker.setFlat(false);
        });
      },
      setMarker: function(map, position, imgUrl) {
        map.addMarker({
          'position': position
        }, function(marker) {
          marker.setIcon({
            'url': imgUrl,
            'size': {
              width: 40,
              height: 55
            }
          }),
          marker.setFlat(false);
        });
      },
      getPositions: function(activity) {
        var positions = [];
        activity.dataLog.forEach(function (element) {
          positions.push(new plugin.google.maps.LatLng(element.lat, element.lng));
        });
        return positions;
      },
      getScaleVal: function(dataLog,xMin,xMax,yMin,yMax){
        var objScale ={};
        var x = 0;
        var xA = [];
        var yA = [];
        var y = 0;
        var allPos= [];
        var pos;
        for (var i = 0 in dataLog) {
            var curLat = dataLog[i].lat;
            var curLng = dataLog[i].lng;
            pos = new google.maps.LatLng({lat:curLat, lng: curLng});
            allPos.push(pos);

          if (xMin > curLat) {xMin = curLat;}
          if (xMax < curLat) {xMax = curLat;}
          if (yMin > curLng) {yMin = curLng;}
          if (yMax < curLng) {yMax = curLng;}
          x = x + curLat;
          xA.push(curLat);
          y = y + curLng;
          yA.push(curLng);
        }
        // define scaleval
        if (dataLog.length > 1) {
          var scaleValX = Math.abs(1 / (Math.max.apply(null, xA) - Math.min.apply(null, xA)));
          if (isFinite(scaleValX) == false) {
            scaleValX = 0;
          }
          var scaleValY = Math.abs(1 / (Math.max.apply(null, yA) - Math.min.apply(null, yA)));
          if (isFinite(scaleValY) == false) {
            scaleValY = 0;
          }
          if (scaleValX > scaleValY) {scaleVal = scaleValY * .9;} else {scaleVal = scaleValX * .9;}
          scaleVal = scaleVal / 350;
          scaleVal += 15;
        } else {
          scaleVal = 17;
        }
        objScale.scale = scaleVal;
        objScale.xMin = xMin;
        objScale.xMax = xMax;
        objScale.yMin = yMin;
        objScale.yMax = yMax;

        return objScale;
      }

    };
  })

  // This factory is used to manage the users
  .factory('UserService', function ($http, $rootScope, $q, $sanitize, server) {

    // Our user variable
    var user = {};

    var market = {};
    // Our user token variable
    var token = {};
    // Offline mode
    var offlineMode = false;

    return {
      // Return the current username
      getUsername: function () {
        return user.name;
      },
      // Return the current email
      getEmail: function () {
        return user.email;
      },
      getUserId: function () {
        return user._id;
      },
      // Return the current user's token
      getToken: function () {
        return token;
      },
      getUser: function () {
        return user;
      },
      getStravaToken: function () {
        if (typeof user.stravaProfile =='undefined'){
          return null;
        } else {
          return user.stravaProfile.access_token;
        }
      },
      // Try to create a new user if the email is not already used
      createAccount: function (newUser, successFct, errorFct) {
        console.log(" >services createAccount()");
        console.dir(newUser);
        // To avoid script injection (remove dangerous html)
        newUser.username = $sanitize(newUser.username);
        newUser.password = $sanitize(newUser.password);
        // Request the server to try to add the user
        $http.post(server.url + ":" + server.port + '/createAccount', newUser).then(
          function (response) {
            // Success
            successFct(response);
          }, function (response) {
            // Fail
            errorFct(response);
          }
        );
      },


      connectwithStrava: function (data, successFct, errorFct) {
        console.log(" >service connectwithStrava() " + user.email);
        //data.email = $sanitize(data.email);
        // Request the server to try to add the user
        $http.post(server.url + ":" + server.port + '/connectwithStrava', {email:user.email, stravaData:data}).then(
          function (response) {
            console.log(" success " + response);
            // Get the user's informations
            user = response.data.user;
            localStorage.setItem('user', JSON.stringify(user));
            token = response.data.token;
            localStorage.setItem('token', JSON.stringify(token));
            // All the next http requests will have the token in the header
            $http.defaults.headers.common['authorization'] = token;
            successFct(response);
          }, function (response) {
            console.log(" fail" + response);
            console.dir(response);
            errorFct(response);
          }
        );
      },


      // optimize notifcation generator button
      shareToStrava: function (stravaID, fileURI, activityname, successFct, errorFct) {
        console.log(" >services shareToStarva(): "+activityname+" - "+fileURI);
        $http.post(server.url + ":" + server.port + '/uploadToStrava', JSON.stringify({
          stravaID: stravaID,
          fileName: fileURI,
          activityname: activityname
        })).then(
          function (response) {
            // Success
            successFct(response);
          }, function (response) {
            // Fail
            errorFct(response);
          }
        );
      },

      // optimize notifcation generator button
      optimizeNotification: function (myUser, myActivity, successFct, errorFct) {
        console.log(" >services optimizeNotification() " + myUser + " - " + myActivity);
        // Request the server to try to add the user
        $http.post(server.url + ":" + server.port + '/optimizeNotification', {
          userID: myUser,
          activity: myActivity
        }).then(
          function (response) {
            // Success
            successFct(response);
          }, function (response) {
            // Fail
            errorFct(response);
          }
        );
      },

      // save user score

      updateUserScore: function (userEmail, userScore) {
        console.log(" >service updateUserScore() " + userEmail + " - " + userScore);

        // Request the server to try to add the user
        $http.post(server.url + ":" + server.port + '/updateUserScore', {score: userScore, email: userEmail}).then(
          function (response) {
            console.log(" success " + response);
          }, function (response) {
            console.log(" fail" + response);
          }
        );
      },

      // Change the offline mode
      setOfflineMode: function (val) {
        offlineMode = val;
      },
      // Returns if the user is in offline mode
      getOfflineMode: function () {
        return offlineMode;
      },
      // Try to connect the user, and returns a token if successfully
      connect: function (curUser, successFct, errorFct) {
        offlineMode = false;
        // To avoid script injection (remove dangerous html)
        curUser.email = $sanitize(curUser.email);
        curUser.password = $sanitize(curUser.password);
        // Request the server to try to connect the user
        $http.post(server.url + ":" + server.port + '/connect', curUser).then(
          function (response) {
            // Success
            if (response.data != undefined) {
              // Get the user's informations
              user = response.data.user;
              localStorage.setItem('user', JSON.stringify(user));
              token = response.data.token;
              localStorage.setItem('token', JSON.stringify(token));
              // All the next http requests will have the token in the header
              $http.defaults.headers.common['authorization'] = token;
              successFct(response);
            }
            else
              errorFct(response);
          }, function (response) {
            // Fail
            errorFct(response);
          }
        );
      },
      // Try to connect the user with Facebook, and returns a token if successfully
      connectSocialMedia: function (curUser, successFct, errorFct) {
        offlineMode = false;
        // To avoid script injection (remove dangerous html)
        curUser.email = $sanitize(curUser.email);
        curUser.name = $sanitize(curUser.name);
        curUser.id = $sanitize(curUser.id);
        curUser.socialMedia = $sanitize(curUser.socialMedia);
        // Request the server to try to connect the user
        $http.post(server.url + ":" + server.port + '/connectSocialMedia', curUser).then(
          function (response) {
            // Success
            if (response.data != undefined) {
              // Get the user's informations
              user = response.data.user;
              token = response.data.token;
              // All the next http requests will have the token in the header
              $http.defaults.headers.common['authorization'] = token;
              successFct(response);
            }
            else
              errorFct(response);
          }, function (response) {
            // Fail
            errorFct(response);
          }
        );
      },
      // Disconnect the user
      disconnect: function () {
        user = {};
        if (typeof facebookConnectPlugin !== 'undefined' && offlineMode == false)
          facebookConnectPlugin.logout(function () {
          }, function () {
          });
        offlineMode = false;
      },

      // Returns all the activities
      getUserObject: function () {
        return user;
      },
      getGender: function () {
        var gender = 0;
        if (typeof user.profile != 'undefined') {
          if (user.profile.gender = "male") gender = 1;
        }
        return gender;
      },
      // Returns all the activities
      getActivities: function () {
        return user.activities;
      },

      getActivityTypeList: function (successFct, errorFct) {
        console.log("service getActivityTypeList");
        $http.post(server.url + ":" + server.port + '/getActivityTypeList', "").then(
          function (response) {
            // Success
            console.dir(response);
            successFct(response);
          }, function (response) {
            // Fail
            errorFct(response);
          }
        );
        //  out = ["xing", "ggdBiking",  "gd", "ghh", "ssss"];
        //return out;
      },


      getUserVO2: function (averageSpeed) {
        //returns: V02 max score using Cooper test
        //Based on average speed for entire activity
        //Average speed * 200 converts from kilometers/hour to meters/12min.
        //Improved model should use largest distance traveled in 12 minute period
        if (averageSpeed == null) {
          return 35;
        } else {
          return ((averageSpeed * 200) - 504.9) / 44.73;
        }
      },

      getUserScore: function (age, sex, VO2) {
        /*
         age: Age of the user
         sex: Sex of the user, 0 = female, 1 = male
         VO2: VO2 value of user generated from current activity
         Returns: userScore, an ordinal value of performance based on VO2 table
         Function first determines what array to use then generates score
         Arrays are categorized by sex and age range
         */
        var userArray;
        var userVO2 = VO2;
        var f1825 = [28, 32, 37, 41, 46, 56, 125];
        var f2635 = [26, 30, 34, 38, 44, 52, 125];
        var f3645 = [22, 26, 30, 33, 37, 45, 125];
        var f4655 = [20, 24, 27, 30, 33, 40, 125];
        var f5665 = [18, 21, 24, 27, 31, 37, 125];
        var fOver65 = [17, 18, 22, 24, 27, 32, 125];
        var m1825 = [30, 36, 41, 46, 51, 60, 125];
        var m2635 = [30, 34, 39, 42, 48, 56, 125];
        var m3645 = [26, 30, 34, 38, 42, 51, 125];
        var m4655 = [25, 28, 31, 35, 38, 45, 125];
        var m5665 = [22, 25, 29, 31, 35, 41, 125];
        var mOver65 = [20, 21, 25, 28, 32, 37, 125];
        if (sex == 0) {
          if (age <= 25) {
            userArray = f1825;
          } else if (age > 25 && age <= 35) {
            userArray = f2635;
          } else if (age > 35 && age <= 45) {
            userArray = f3645;
          } else if (age > 45 && age <= 55) {
            userArray = f4655;
          } else if (age > 55 && age <= 65) {
            userArray = f5665;
          } else {
            userArray = fOver65;
          }
        } else if (sex == 1) {
          if (age <= 25) {
            userArray = m1825;
          } else if (age > 25 && age <= 35) {
            userArray = m2635;
          } else if (age > 35 && age <= 45) {
            userArray = m3645;
          } else if (age > 45 && age <= 55) {
            userArray = m4655;
          } else if (age > 55 && age <= 65) {
            userArray = m5665;
          } else {
            userArray = mOver65;
          }
        } else {
          return null;
        }
        if (userVO2 <= userArray[0]) {
          userScore = 1;
        } else if (userVO2 > userArray[0] && userVO2 <= userArray[1]) {
          userScore = 2;
        } else if (userVO2 > userArray[1] && userVO2 <= userArray[2]) {
          userScore = 3;
        } else if (userVO2 > userArray[2] && userVO2 <= userArray[3]) {
          userScore = 4;
        } else if (userVO2 > userArray[3] && userVO2 <= userArray[4]) {
          userScore = 5;
        } else if (userVO2 > userArray[4] && userVO2 <= userArray[5]) {
          userScore = 6;
        } else if (userVO2 > userArray[5] && userVO2 <= userArray[6]) {
          userScore = 7;
        } else {
          userScore = 0;
        }
        return userScore;
      },


      //////////////////////////////////////////////////////////////////////////
      // This section is used to manage all the Activities for the current user
      //////////////////////////////////////////////////////////////////////////

      // Try to connect the user, and returns a token if successfully
      connectToMarket: function (successFct, errorFct) {
        offlineMode = false;
        $http.post(server.url + ":" + server.port + '/MarketplaceList', {email: user.email}).then(
          function (response) {
            // Success
            if (response.data != undefined) {
              // Get the user's informations
              console.log("-----------connectToMarket success");
              console.dir(response.data.market);
              market = response.data.market;
              //  localStorage.setItem('market',JSON.stringify(market));
              // token = response.data.token;
              // localStorage.setItem('token',JSON.stringify(token));
              // // All the next http requests will have the token in the header
              // $http.defaults.headers.common['authorization'] = token;
              successFct(market);
            }
            else
              errorFct(response);
          }, function (response) {
            // Fail
            errorFct(response);
          }
        );
      },

      // Returns all the activities
      getMarketActivities: function () {
        console.log('>service getMarketActivities()');
        return market;
      },

      updateActivity: function(updateActivity, succesFct, failFct) {
        console.log('inside updateActivity service');
        console.dir(updateActivity);
        $rootScope.updateActivity = $q.defer();
        if (offlineMode == true) {

          // user.activities.push(newActivity);
          // FileService.writeData({activities: newActivity});
          // $rootScope.createActivity.resolve();
        } else {
          // Request the server to add a new deck
          $http.put(server.url + ":" + server.port + '/api/updateActivity', JSON.stringify({
            email: user.email,
            activity: updateActivity
          })).then(
            function (response) {
              console.log("here success!!!!!!");
              // Success
              succesFct(response);
              // user.activities.push(response.data.activity);
              $rootScope.updateActivity.resolve();
            }, function (response) {
              console.log("here FAILLLLLL!!!!!!");
              // Fail
              failFct(response);
              $rootScope.updateActivity.resolve();

            }
          );
        }
      },

      addActivity: function (newActivity, succesFct, failFct) {
        console.log('inside addActivity service');
        console.dir(newActivity);
        // Used to notify the controller we are done
        $rootScope.createActivity = $q.defer();
        // If we are in offline mode
        if (offlineMode == true) {
          user.activities.push(newActivity);
          FileService.writeData({activities: newActivity});
          $rootScope.createActivity.resolve();
        } else {
          // Request the server to add a new deck
          $http.post(server.url + ":" + server.port + '/api/addActivity', JSON.stringify({
            email: user.email,
            activity: newActivity
          })).then(
            function (response) {
              // Success
              succesFct(response);
              user.activities.push(response.data.activity);
              $rootScope.createActivity.resolve();
            }, function (response) {
              // Fail
              failFct(response);
              $rootScope.createActivity.resolve();

            }
          );
        }
        return newActivity;
      },
      addSession: function (newActivity, parentActivityId, succesFct, failFct) {
        console.log('inside addActivity service');
        console.dir(newActivity);
        // Used to notify the controller we are done
        $rootScope.createActivity = $q.defer();
        // If we are in offline mode
        //TODO : the offline mode is not fully implemented and would need some love!!!
        if (offlineMode == true) {

          FileService.writeData({activities: newActivity});

        } else {
          // Request the server to add a new deck
          $http.post(server.url + ":" + server.port + '/api/addSession', JSON.stringify({
            email: user.email,
            activity: newActivity,
            parentActivityId: parentActivityId
          })).then(
            function (response) {
              // Success
              succesFct(response);
;
            }, function (response) {
              // Fail
              failFct(response);

            }
          );
        }
        return newActivity;
      },



      publishToMarketplace: function (newActivity, marketInfo, successFct, errorFct) {

        var myDefer = $q.defer();

        if (newActivity != 'undefined' || newActivity != null) {
          newActivity.boughtFromMarketplace = false;
          var myMarketItem = {
            activity: newActivity,
            author: marketInfo.author,
            price: Number(marketInfo.price),
            isPublished: true,
            description: marketInfo.description,
            nbDownloads: 0,
            datePublished: Date.now(),
            parentId: newActivity._id
          };
          if (offlineMode == false) {
            //Testing purposes
            console.log('myMarketItem: ');
            console.dir(myMarketItem);
            $http.post(server.url + ":" + server.port + '/api/publishToMarketplace', {
              email: user.email,
              marketplace: myMarketItem
            }).then(
              //success
              function (success) {
                console.log('Inside addToMarketplace success with returned message : ');
                // console.dir(success);
                // myDefer.resolve(success);
                // return myDefer.promise;
                successFct(success)
              },
              //fail
              function (fail) {
                console.log('Inside addToMarketplace fail with message: ');
                // console.dir(fail);
                // alert(server.url + ":" + server.port + '/api/addToMarketplace');
                // myDefer.reject('Could not insert into server marketplace: ' + fail);
                // return myDefer.promise;
                errorFct(fail)
              });

          } else {
            myDefer.reject('User must sign in into account');
            return myDefer.promise;
          }//else
        }//if not empty or null

        else {
          myDefer.reject('No data was sent into publish to marketplace function');
          return myDefer.promise;
        }

      }, //end of function publishToMarketplace

      // Add Rating
      updateMarketItemRating: function (rating, marketItem, userID, sucessFct, errorFct) {
        console.log('>service updateRating ' + userID);
        $http.post(server.url + ":" + server.port + '/updateMarketItemRating', {
          rating: rating,
          userID: userID,
          marketItem: marketItem
        }).then(
          function (response) {
            // Success
            console.dir(response);
            //successFct(response);
          }, function (response) {
            // Fail
            //  errorFct(response);
          }
        );

      },


      buyMarketItem: function (userEmail, selectedMarketItem, state, myActivity, functionreturn) {
        console.log("-----------buyMarketItem Services by " + userEmail);
        $http.post(server.url + ":" + server.port + '/buyMarketItem', {
          email: userEmail,
          marketItemID: selectedMarketItem._id
        }).then(
          function (response) {
            // Success
            if (response.data != undefined) {
              // Get the user's informations
              console.log("-----------buyMarketItem success");
              //connect(user,function(){console.log("sucess")}, function(){console.log("fail")});
              functionreturn();
              state.go("menu.myActivitiesList", {activity: myActivity});
              //successFct(response);
            }
            else
            //errorFct(response);
              console.log("-----------buyMarketItem errorFct");
          }, function (response) {
            // Fail
            // errorFct(response);
            console.log("-----------buyMarketItem errorFct");
          }
        );
      },


      getMarketplaceList: function (refresh) { //NOT USED
        console.log('inside getMarketplaceList');
        var myDefer = $q.defer();

        if (($rootScope.marketList != 'undefined' && $rootScope.marketList != null) || !refresh) {
          myDefer.resolve($rootScope.marketList);
          console.log('return rootscope.marketlist as a promise');
          //return myDefer.promise;

        } else if (refresh || ($rootScope.marketList == 'undefined' || $rootScope.marketList == null)) {
          console.log('gettting marketList from server');
          $rootScope.marketList = [];

          $http.post(server.url + ":" + server.port + '/api/MarketplaceList', {email: user.email, token: token}).then(
            //success
            function (success) {


              if (success.data.marketplace.length < 1) {
                myDefer.reject();
                //return myDefer.promise
              } else {
                myDefer.resolve(success.data.marketplace);
                //return myDefer.promise;

              }//else
            },
            //fail
            function (fail) {
              myDefer.reject();
              //return myDefer.promise;

            });
        } else {
          myDefer.reject('Inside the ELSE statement for UserService.getMarketplaceList -> ***THIS IS AN ERROR***');
          //return myDefer.promise;
        }//else

        return myDefer.promise;
      } //end of function getMarketplaceList


    };


  })

  // This factory is used to manage all the Activities for the current user
  .factory('ActivityService', function ($http, $rootScope, $q, server, UserService, FileService,UtilitiesService, PopupService, $cordovaFile, $cordovaFileTransfer, $cordovaFile, $translate, MapService) {

    //New server Database uses the object called Activity instead of old variables.

    /*
     Variable needed to link current activity with the Server's copy,
     it's located outside the Activity variable in case the current activity doesn't exist inside the server yet.
     */
    var id = "";

    /*
     Variable used to store current session information,
     this is the currently active Activity that we are either recording or playing
     */
    var myActivity = {

      //Name of the current activity loaded in memory
      activityName: "",

      //array that will contain objects with relevant data needed for the each of the user's position, (i.e. coordinates, heart rate, timestamp, etc)
      dataLog: [],
      //String defining what type of activity it is, for example : cycling, swimming, etc (default = cycling)
      activityType: "",

      //boolean flag used to determine if the author wants to make this activity public or not
      isPublished: false,

      //boolean flag used to determine if the author wants to sell this activity or not
      isInMarketplace: false,

      //information is an object that contains general information of the overall activity
      info: {
        distance: 0,
        completedInHours: 0,
        completedInMinutes: 0,
        completedInSeconds: 0,
        averageSpeed: 0,
        resetPausedTime: 0
      },

      //this array will contain a giant object that will contain, among other things, the metricObject[] and the messageObject[] that are used to generate the notifications and link them to the activities coordinates.
      notifications: [
        {
          metricObject: [{}],
          messageObject: [{}]
        }

      ],
    }; //end of activity variable definition

    return {

      //creates a new empty Activity
      resetActivity: function () {

        $rootScope.Activity = {
          dataLog: [],
          name: 'New Activity ' + (new Date).toLocaleString(),
          activityType: 'cycling',
          isPublished: false,
          isInMarketplace: false,
          info: {distance: 0, completedInHours: 0, completedInMinutes: 0, completedInSeconds: 0, averageSpeed: 0},
          notifications: []
        };

        myActivity = $rootScope.Activity;

        return myActivity;
      },

      //Initializes Global Activity inside Root Scope, should not be called everytime
      newActivity: function () {

        $rootScope.Activity = {
          dataLog: [],
          name: 'New Activity ' + (new Date).toLocaleString(),
          activityType: 'cycling',
          isPublished: false,
          isInMarketplace: false,
          info: {distance: 0, completedInHours: 0, completedInMinutes: 0, completedInSeconds: 0, averageSpeed: 0},
          notifications: []
        };

        myActivity = $rootScope.Activity;

        return myActivity;
      },

      writeActivityCallback: function(myActivity) {
        var deferred = $.Deferred();
        $cordovaFile.writeFile(cordova.file.dataDirectory, "currentActivity.txt", JSON.stringify(myActivity), true)
          .then(function(success) {
            deferred.resolve(success);
          }, function(err) {
            var err = new Error("Fail to write to file in Callback");
            deferred.reject(err);
          });

        return deferred.promise();
      },

      // Function to get currentActivity if the app crushed
      importUnsavedActivity: function() {
        // this function will check if 'currentActivity.txt' exist in the local file system

        // if it exists, we'll assign the UnsavedData in the file to $rootScope.Activity
        // if there is no unsaved activity, we'll just create a new one
        // this will return the $rootScope.Activity

        var deferred = $.Deferred();

        $cordovaFile.checkFile(cordova.file.dataDirectory, "currentActivity.txt")
          .then(function(success) {
            console.log("The file exists!");
            // $scope.myActivity = ActivityService.newActivity();

            $cordovaFile.readAsText(cordova.file.dataDirectory, "currentActivity.txt")
              .then(function(myUnsavedData) {
                console.log("Read file success!");
                //console.log(myUnsavedData, undefined, 2);
                $rootScope.Activity = myUnsavedData;
                try {
                  $rootScope.Activity = JSON.parse(myUnsavedData);
                } catch (e) {
                  console.log ("Not a JSON, moving along :"+e);
                }
                deferred.resolve(myUnsavedData);
              }, function(fail) {
                console.log("Read file fail!");
                var err = new Error("Cannot parse myUnsavedData");
                deferred.reject(err);
              })
          }, function(fail) {
            console.log("The file doesn't exist");
            var err = new Error("File does not exist");
            deferred.reject(err);
          });
          return deferred.promise();
      },

      //Function to get the activity you need for each controller
      importActivity: function () {
        return $rootScope.Activity;
      },

      //sync Global Activity Object with the local one
      syncActivity: function (localActivity) {
        $rootScope.Activity = localActivity;
      },

      clearAllMetricObjects : function(activity){
        for (var i = 0; i < activity.notifications.length; i++) {
          activity.notifications[i].metricObject = [];
        }
      },
// Remove a Activity
      removeActivity: function (activity, email, successFct, errorFct) {
        console.log("services removeActivity() " + activity._id + " email:" + email);
        if (activity == null) {
          errorFct();
          return;
        }
        // If we are in offline mode
        if (UserService.getOfflineMode() == true) {
          activities = _.reject(activities, function (curDeck) {
            return curActivity._id == activity._id;
          });
          FileService.writeData({activites: activities});
          successFct();
        }
        else {
          // Request the server to delete the deck
          $http.post(server.url + ":" + server.port + '/api/deleteActivity', {
            email: email,
            activityID: activity._id
          }).then(
            function (response) {
              // Successf
              console.log("services removeActivity success");
              user = response.data.user;
              console.dir(user);
              successFct(user.activities);
            }, function (response) {
              // Fail
              console.log("services removeActivity fail");
              errorFct();
            }
          );
        }
      },

      updateActivity :function (activity, successFct, errorFct) {
        console.log(">updateActivity()" );
        $http.post(server.url + ":" + server.port + '/api/updateActivity', {
          email: UserService.getEmail(),
          activity: activity
        }).then(
          function (response) {
            // Success
            console.log("services updateActivity success");
            user = response.data.user;
            console.dir(user);
            successFct(user.activities);
          }, function (response) {
            // Fail
            console.log("services updateActivity fail");
            errorFct();
          }
        );
      },

      getDataLog : function(filename){
        var deferred = $.Deferred();
        console.log(">getDataLog()" );
        var theLog = [];
        //read file locally if it exists
        if(typeof $cordovaFile != 'undefined' ) {
          $cordovaFile.checkFile(cordova.file.dataDirectory, filename)
            .then(function (checkFileSuccess) {
              // success
              console.log("getDataLog: the file exist "+ filename);

              $cordovaFile.readAsText(cordova.file.dataDirectory, filename)
                .then(function (myjson) {
                  // success
                 // console.log ('==========================HERE IS THE LOG ===================');
                  theLog = JSON.parse(myjson);
                  //console.dir (theLog);
                  return deferred.resolve(theLog);
                }
              )}, function (checkFileError) {
              // error
              console.log("getDataLog: the file doen't exist locally. Checking for file on AWS-S3...");

              //read file from S3 if it does not exist locally
              s3Downloader.download(filename)
                .then(function(response) {
                  // success
                  var dataLogFromS3 = response;
                  theLog = dataLogFromS3;
                  console.log("Stringified Data: " + JSON.stringify(dataLogFromS3));

                  // write file to device local storage
                  $cordovaFile.writeFile(cordova.file.dataDirectory, filename, JSON.stringify(dataLogFromS3), true)
                    .then(function(writeFileSuccess) {
                      // success
                      $cordovaFile.readAsText(cordova.file.dataDirectory, filename)
                        .then(function(myjson) {
                          theLog = JSON.parse(myjson);
                          console.log("theLog: ", theLog)
                          return deferred.resolve(theLog);
                        })
                    })
                }, function(downloadError) {
                    // error
                    console.log("There is an error with the response: ", downloadError);
                  console.dir(downloadError);
                    return deferred.reject(downloadError);
                })
            });
        }
        return deferred.promise();
      },

      getMaxSpeed: function (activity) {
        // console.log("services getMaxSpeed() ");
        var maxspeed = 0;
        if (activity.dataLog.length > 1) {
          for (i = 0; i < activity.dataLog.length; i++) {
            if (Number(activity.dataLog[i].speed) > maxspeed) maxspeed = Number(activity.dataLog[i].speed);
          }
        }
        return maxspeed;
      },

      getElevationGain: function (activity) {
        //console.log("services getElevationGain() ");
        var elevationGain = 0;
        if (activity.dataLog.length > 2) {
          for (i = 1; i < activity.dataLog.length; i++) {
            if (activity.dataLog[i].altitude > activity.dataLog[i - 1].altitude) {
              elevationGain += (activity.dataLog[i].altitude - activity.dataLog[i - 1].altitude);
            }
          }
        }
        return elevationGain;
      },
      getElevationLoss: function (activity) {
        //console.log("services getElevationLoss() ");
        var elevationLoss = 0;
        if (activity.dataLog.length > 2) {
          for (i = 1; i < activity.dataLog.length; i++) {
            if (activity.dataLog[i].altitude < activity.dataLog[i - 1].altitude) {
              elevationLoss += (activity.dataLog[i - 1].altitude - activity.dataLog[i].altitude);
            }
          }
        }
        return elevationLoss;
      },

      getElevationSegment: function (activity) {
          //console.log("services getElevationSegment() ");
          /*
          Definition of values for Elevation Segment
          0 = Downhill
          1 = Flat
          2 = Uphill
          */
          var elevationLoss = 0;
          if (activity.dataLog.length > 24) {
              for (i = 1; i < (activity.dataLog.length - 12) ; i ++) {
                  if ((activity.dataLog[i].altitude + 5) < activity.dataLog[i + 11].altitude) {
                      activity.dataLog[i].elevationSegment = 2;
                  }
                  else if (activity.dataLog[i].altitude > (activity.dataLog[i + 11].altitude + 5)) {
                      activity.dataLog[i].elevationSegment = 0;
                  }
                  else {
                      activity.dataLog[i].elevationSegment = 1;
                  }
              }
          }
      },
      getBestSegment: function (activity) {
          // console.log("services getMaxSpeed() ");
          /*
          Returns: an array of the fastest speeds reached during the activity, based on elevation change [downhill, flat, uphill]
          */
          var bestDown = 0;
          var bestFlat = 0;
          var bestUp = 0;
          var bestSegment = array[bestDown, bestFlat, bestUp];
          if (activity.dataLog.length > 3) {
              for (i = 1; i < (activity.dataLog.length + 1); i++) {
                  if (activity.dataLog[i].elevationSegment = 0) {
                      if (activity.dataLog[i].speed > bestDown) bestDown = Number(activity.dataLog[i].speed);
                  }
                  if (activity.dataLog[i].elevationSegment = 1) {
                      if (activity.dataLog[i].speed > bestFlat) bestFlat = Number(activity.dataLog[i].speed);
                  }
                  if (activity.dataLog[i].elevationSegment = 2) {
                      if (activity.dataLog[i].speed > bestFlat) bestUp = Number(activity.dataLog[i].speed);
                  }
              }
          }
          return bestSegment;
      },

      getAverageEstimatedPowerOutput: function (activity) {
        // console.log("services getAverageEstimatedPowerOutput() ");
        var out = 0;
        var sum = 0;
        var increment = 0;
        for (i = 1; i < activity.dataLog.length; i++) {
          if (activity.dataLog[i].power != null && activity.dataLog[i].power > 0) {
            sum += activity.dataLog[i].power;
            increment++;
          }
        }
        if (increment > 0) {
           out = Math.round(sum / increment);
         }
        return out;
      },

      getEstimatedPowerOutput: function (dataLog) {
        //console.log("services getEstimatedPowerOutput() "+ dataLog.length);
        /*
         returns: estimated power output in watts
         */
        var epo = 0;
        var v0 = 0;
        var v1 = 0;
        var e0 = 0;
        var e1 = 0;
        var weight = 160;
        var i = dataLog.length - 1;
        if (i > 3) {
          if (typeof dataLog[i - 1].speed != 'undefined') {
            v0 = dataLog[i - 1].speed;
          }
          if (typeof dataLog[i].speed != 'undefined') {
            v1 = dataLog[i].speed;
          }
          if (typeof dataLog[i - 1].altitude != 'undefined') {
            e0 = dataLog[i - 1].altitude;
          }
          if (typeof dataLog[i].altitude != 'undefined') {
            e1 = dataLog[i].altitude;
          }
          if (typeof UserService.getUser() != 'undefined'){
            if (typeof UserService.getUser().profile.weight != 'undefined' && typeof UserService.getUser() != null) {
              weight = UserService.getUser().profile.weight;
            }
          }
          epo = ((weight / 9.81) * (v1 - v0) * v1) + (weight * (e1 - e0)) + (0.218 * (v1) ^ 2);
          if (epo < 0) {
              epo = 0;
               dataLog[i].power = epo;
          }
          if (typeof dataLog[i - 1].power != 'undefined') {
              dataLog[i].power = epo;
          } else {
                dataLog[i].power = ((epo + dataLog[i - 1].power) / 2);
          }
        }
        return epo;
        console.log(epo);
      },
      getSmoothPowerOutput: function (dataLog) {
        //console.log("services getEstimatedPowerOutput() "+ dataLog.length);
        /*
         returns: estimated power output in watts
         */
        var increment = 5;
        var epo = 0;
        var v0 = 0;
        var v1 = 0;
        var e0 = 0;
        var e1 = 0;
        var weight = 160;
        var i = dataLog.length - 1;
        if (i > (1+increment) ) {
          // TODO: calculate 5 previsous valuues average for v0 and e0
          if (typeof dataLog[i - increment].speed != 'undefined') {
            v0 = dataLog[i - increment].speed;
          }
          if (typeof dataLog[i - increment].altitude != 'undefined') {
            e0 = dataLog[i - increment].altitude;
          }

          if (typeof dataLog[i].speed != 'undefined') {
            v1 = dataLog[i].speed;
          }
          if (typeof dataLog[i].altitude != 'undefined') {
            e1 = dataLog[i].altitude;
          }
          if (typeof UserService.getUser() != 'undefined'){
            if (typeof UserService.getUser().profile.weight != 'undefined' && typeof UserService.getUser() != null) {
              weight = UserService.getUser().profile.weight;
            }
          }
          epo = ((weight / 9.81) * (v1 - v0) * v1) + (weight * (e1 - e0)) + (0.218 * (v1) ^ 2);
          if (epo < 0) {
              epo = 0;
               dataLog[i].power = epo;
          }
          if (typeof dataLog[i - 1].power != 'undefined') {
              dataLog[i].power = epo;
          } else {
                dataLog[i].power = ((epo + dataLog[i - 1].power) / 2);
          }
        }
        return epo;
        console.log(epo);
      },

      // getSmoothPowerOutput: function(activity) {
      //   /*
      //    Returns: Average power output from the 5 most recent data points
      //    */
      //   var i = dataLog.length - 1;
      //   var x = 1;
      //   smoothPower = 0;
      //   if (typeof dataLog[i].power != 'undefined') {
      //     return smoothPower;
      //   }
      //   else {
      //     smoothPower = datalog[i].power;
      //     while (true){
      //       if (typeof dataLog[(i - x)].power != 'undefined') {
      //         break;
      //       }
      //       else if (x > 5){
      //         x -= 1;
      //         break;
      //       }
      //       else {
      //         smoothPower += dataLog[(i - x)].power;
      //         x += 1;
      //       }
      //     }
      //   }
      //   return (smoothPower / x);
      // },


      getAverageSpeed: function (activity) {
        //console.log("services getAverageSpeed() t: "+ activity.info.completedTime+" - d: "+activity.info.distance );
        var out = 0;
        if (activity.info.distance > 0 && activity.info.completedTime > 0) {
          out = Math.round((activity.info.distance) / (activity.info.completedTime / 1000));
        } else {
          out = 66;
        }
        return out;
      },


      getActivityScore: function (activity, avgspeed, elevationGain, elevationloss) {

          // console.log("services getActivityScore() ");

          /*
          Revision in progress. This code needs to be tested
          */

          var out = 0;
          userWeight = 60; // Default weight in case a value can't be obtained from the user profile
          if (typeof UserService.getUser() != 'undefined') {
              if (typeof UserService.getUser().profile.weight != 'undefined' && typeof UserService.getUser() != null) {
                  userWeight = UserService.getUser().profile.weight;
              }
          }

          averageVelocity = avgspeed;
          grade = (elevationGain - elevationloss) / (activity.info.distance);
          rollResistance = userWeight * 9.8 * 0.004;
          airResistance = 0.5 * 0.5 * 0.5 * 1.2 * averageVelocity;
          climb = userWeight * 9.8 * grade;
          out = Math.round((rollResistance + airResistance + climb) * averageVelocity);
          //sconsole.log("Score OUT: "+ out);
          return out;
      },

      findLatestMovingData: function(dataLog) {
        console.log("services findLatestMovingData() ");
        console.dir(dataLog);
      var found = 0;
      for ( i = 0; i < dataLog.length - 1; i++) {
        if (dataLog[dataLog.length - i - 1].speed >.4 ) //.4m/s is 1.44km/k or 1ms is 3.6km/h
        {
          found = 1;
          UtilitiesService.log("DEBUG","findLatestMovingData is "+ i +"/"+dataLog.length);
          return dataLog[dataLog.length-(i+1)];
        }

      }
      if(found == 0){
        UtilitiesService.log("DEBUG","findLatestMovingData is the latest ");
        return dataLog[dataLog.length -1];
      }
    },

      getCaloriesSpent: function (duration) {
        var caloriesSpent = 0;
        console.log("services getCaloriesSpent() " + duration);
        if (duration > 0) {
          caloriesSpent = Math.round((duration / 1000) * 650 / 3600);
        }
        return caloriesSpent;
      },

      createSplitNotification: function (typemsg, msg,dataLogPoint,myActivity,map) {
        // if (map != null){
        //   MapService.setMarkerType(map, dataLogPoint.coords, 'start');
        // }
        var notif={
          metricObject: [{type: 'gps', lat: dataLogPoint.lat, lng: dataLogPoint.lng, timestamp: dataLogPoint.timestamp, time: dataLogPoint.timestamp - myActivity.dataLog[0].timestamp, dataLogPoint: dataLogPoint.altitude, speed: dataLogPoint.speed}],
          messageObject: [{type: typemsg, id: '1', message: typemsg +" - "+ msg, name: UtilitiesService.getNotifName(myActivity.notifications,typemsg,"alpha")}]
        };
        return notif;
      },

      getAllNotifications: function(myActivity){

          var AllNotifications=[];
          console.log("notifications loop "+ myActivity.notifications.length);
          for (var i = 0; i < myActivity.notifications.length;i++){

            console.dir(myActivity.notifications[i]);
            AllNotifications.push(myActivity.notifications[i]);
            AllNotifications[i].timestampOrder = myActivity.notifications[i].metricObject[0].timestamp;
         console.log(i+ " notifs dir" + AllNotifications[i].timestampOrder );
          }
          console.dir(AllNotifications);
          return AllNotifications;
      },

      getTotalDistance: function (dataLog) {
        var total_distance = 0;
        var allPos = [];
        for (var i = 0 in dataLog) {
          var curLat = dataLog[i].lat;
          var curLng = dataLog[i].lng;
          var pos = new google.maps.LatLng({lat: curLat, lng: curLng});
          allPos.push(pos);
          if (i != 0) {
            total_distance = total_distance + Math.round(google.maps.geometry.spherical.computeDistanceBetween(allPos[i], allPos[i - 1]));
          }
        }
        return total_distance;
      },

      // Add split function here to make it accessible to all pages
      countNotifType: function (myActivity, type) {
        var n = 0;
        for (i = 0; i < myActivity.notifications.length; i++){
          if ( myActivity.notifications[i].messageObject[0].type == type)
            n++;
        }
        console.log(">countAutoSplit " + n );
        return n;
      },

      clearAutoSplit: function (myActivity) {
        var count=myActivity.notifications.length -1;
        console.log("count  "+ count);
        for (i = count; i >0; i--){
          console.log("loop  "+ i);
          if ( myActivity.notifications[i].messageObject[0].type=='autosplit')
          {
            console.log("Delete "+ i);
            myActivity.notifications[i] = [];
            myActivity.notifications.splice(i,1);
          }
        }
            console.log("+++++++++++++++++++++++++++++++++++");
            console.dir (myActivity.notifications);
      },

      getIdx: function (item, AllNotifications) {
        return AllNotifications.indexOf(item);
      },

      createNotification: function (scope, myActivity, AllNotifications, countNotifType, clearAutoSplit, createSplitNotification, getAllNotifications,map) {
        console.log("createNotification is being executed: ", this);
        console.log("myActivity: ", myActivity);
        var tempDataLogLength = myActivity.dataLog.length;
        var numNewNotif = countNotifType(myActivity, 'autosplit') + 1; //2  (size 10)
        console.log ( "datalog length " + myActivity.dataLog.length );
        console.log ( "autosplits " + numNewNotif );
        UtilitiesService.log("DEBUG", ">createNotification / numNewNotif " + numNewNotif);
        console.log( ">createNotification / numNewNotif " + numNewNotif);
        if (tempDataLogLength>numNewNotif) { //10>1
          clearAutoSplit(myActivity);
          for (var i = 1; i <= numNewNotif ; i++) {
            var id = Math.floor(tempDataLogLength / (numNewNotif+1))*i; // 10/2 =5
            console.log("id - "+ id);
            UtilitiesService.log("DEBUG", "createNotification: " + i+ "/" + tempDataLogLength);
            myActivity.notifications.splice(i,0,createSplitNotification('autosplit',i, myActivity.dataLog[id],myActivity,map));
          }
         // $scope.AllNotifications = [];
          scope.AllNotifications = Array.from(myActivity.notifications);

        }else{
          PopupService.showAlert($translate.instant("Warning"), $translate.instant("Sorry, Your activity is too short"));
        }

        console.log("THIS IS ALL THE NOTIFICATION: ", getAllNotifications(myActivity));
        getAllNotifications(myActivity);
      },

      updateMap: function(myActivity, map) {
        // Clear the map first
        map.clear();

        // Initial start marker
        var startLat = myActivity.dataLog[0].lat;
        var startLng = myActivity.dataLog[0].lng;
        var pos = new plugin.google.maps.LatLng(startLat, startLng);

        MapService.setMarkerType(map, pos, 'start');

        // Final marker
        var endLat = myActivity.dataLog[myActivity.dataLog.length - 1].lat;
        var endLng = myActivity.dataLog[myActivity.dataLog.length - 1].lng;
        var pos = new plugin.google.maps.LatLng(endLat, endLng);

        MapService.setMarkerType(map, pos, 'finish');

        // Notification markers
        for (var i = 1; i < myActivity.notifications.length - 1; i++) {
          myActivity.notifications[i].metricObject.forEach(function (metric, index, array) {
            if (metric.type == "gps") {
              var notifPosition =
                new plugin.google.maps.LatLng(metric.lat, metric.lng);
              //MapService.setMarker(map, notifPosition, MapService.getnotifImg().url);
              console.log("Adding Marker");
              MapService.setMarkerType(map, notifPosition, 'normal');


            }
          }, this);
        }

        // Polyline
        var allPos = [];
        for (var i = 0 in myActivity.dataLog) {
          var curLat = myActivity.dataLog[i].lat;
          var curLng = myActivity.dataLog[i].lng;
          var pos = new plugin.google.maps.LatLng(curLat, curLng);
          allPos.push(pos);
        }


        var trackPath = map.addPolyline({
          'points': allPos,
          'color': 'rgba(0, 165, 255, 0.8)',
          'width': 5,
          'geodesic': true
        });
      },


      deleteNotification: function(scope, myActivity, AllNotifications, idx){
        console.log("createNotification is being executed!");
        UtilitiesService.log("DEBUG", ">deleteNotification " + idx);
        myActivity.notifications.splice(idx,1);
        //$scope.AllNotifications = [];
        scope.AllNotifications = Array.from(myActivity.notifications);
      }

    };
  })

  // This factory manages Audio
  .factory('AudioServices', function ($rootScope, $http, $ionicPlatform, $cordovaFile, $cordovaCapture, $q) {

    // Temporary array of objects representing audio files found in the audio folder
    var tempAudio = [{"name": "none", "id": 0}, {"name": "Record Your Own Audio", "id": 1}, {
      "name": "danger",
      "id": 2,
      "format": "mp3"
    }, {"name": "drink", "id": 3, "format": "mp3"}, {"name": "eat", "id": 4, "format": "mp3"}, {
      "name": "fast",
      "id": 5,
      "format": "mp3"
    }, {"name": "full_gas", "id": 6, "format": "mp3"}, {"name": "jump", "id": 7, "format": "mp3"}, {
      "name": "left",
      "id": 8,
      "format": "mp3"
    }, {"name": "right", "id": 9, "format": "mp3"}];

    return {

      getAudioSync: function () {
        return tempAudio;
      },


      //Function that records 10 seconds of audio
      startRecording: function (filename, tagID, myCallback) {

        //if you try to run the function on the computer then nothing will happen
        if (!ionic.Platform.isAndroid() && !ionic.Platform.isIOS()) {

          console.log("You are in a computer and you pressed the record button");
          myCallback('');
        }


        //Asyncronous Recording using Systems own recording software, it can only record 1 file at a time.
        $cordovaCapture.captureAudio({limit: 1, duration: 20}).then(
          //successful Audio Recording
          function (RecordingSuccess) {

            var myMediaFile = RecordingSuccess[0];
            console.dir(myMediaFile);

            var sourcePath = '';
            var destinationPath = '';


            if (ionic.Platform.isIOS()) {

              //Something cool should happen here

              sourcePath = cordova.file.tempDirectory;
              console.log('sourcePath: ' + sourcePath);

              destinationPath = cordova.file.documentsDirectory;
              console.log('destinationPath: ' + destinationPath);
//
//
//                            console.log('cordova tmp: ' + cordova.file.tempDirectory);
//                            console.log('cordova documents: ' + cordova.file.documentsDirectory);
//
//                            $cordovaFile.checkFile(cordova.file.tempDirectory, myMediaFile.name).then(function(yay1){console.dir(yay1);},function(nay1){console.dir(nay1);});

            } else if (ionic.Platform.isAndroid()) {

              //var sourcePath2 = cordova.file.externalRootDirectory + "Voice Recorder/";
              //console.log('sourcePath2: ' + sourcePath2);
              var aux = decodeURIComponent(myMediaFile.fullPath);
              aux = aux.split(':');
              sourcePath = aux[0] + "://" + aux[1];
              sourcePath = sourcePath.substring(0, sourcePath.lastIndexOf('/')) + '/';
              console.log('sourcePath is: ' + sourcePath);

              destinationPath = cordova.file.externalDataDirectory;
              console.log('destinationPath: ' + destinationPath);
            } else {
              //on Computer
              myCallback(null);

            }

            var audioFileName = myMediaFile.name;
            console.log('name: ' + audioFileName);

            var extension = (myMediaFile.name).split(".")[1];
            console.log('extension: ' + extension);

            var newName2 = filename + "_VictoriseAudio_" + tagID;
            var newName = newName2 + "." + extension;
            console.log('newName: ' + newName);

            $cordovaFile.moveFile(sourcePath, audioFileName, destinationPath, newName).then(
              //success
              function (moveSuccess) {
                console.log('Successfully moved file into app folder and renamed too');
                console.dir(moveSuccess);
                myCallback(newName);
                //moveSuccess.play();
              },

              //fail
              function (moveFail) {

                console.log('Error!!! Failed to move file');
                console.dir(moveFail);
                myCallback(null);
              });

          }, //end of RecordingSuccess

          //Error Recording Audio
          function (err) {
            console.log('Error!!! Could not record audio');
            console.dir(err);
            myCallback(null);
          });

      }, //end of startRecording Function


      play: function (filename, extension, preDefined) {
        $ionicPlatform.ready(function () {
          var src = "";

          if (ionic.Platform.isIOS()) {

            console.log("IOS");
            if (preDefined) {
              src = "audio/";
            } else {
              src = "documents://";
            }
          }//if ios

          else if (ionic.Platform.isAndroid()) {
            console.log("Android");
            if (preDefined) {
              src = cordova.file.applicationDirectory + "www/audio/";
            } else {
              src = cordova.file.externalDataDirectory;
            }
          }//if android
          else {
            console.log("You are on a computer and you pressed the play button");
            //Left undefined on purpose
            return;
          }// if computer

          //Concatinating filename and extension
          src += filename + "." + extension;
          console.log(src);

          //Generating native cordoba Media Object to play Audio
          if (Media) {
            var myMedia = new Media(src,
              //success
              function () {
                console.log('Success in Media');
                myMedia.release();
              },
              //Fail
              function (MediaError) {
                console.log('Fail in MediaError\n Error Code: ' + MediaError.code);
                console.dir(MediaError);
              });

            if (myMedia) {
              myMedia.play();
              console.dir("myMedia " + myMedia);
              // myMedia.release();
            }
          }

        });


      }//end of play function


    };//end of factory return
  })//end of factory

  .factory('SettingService', function (UtilitiesService, $http, server,UserService) {


    var bgLocationSettings =
    {
      // Geolocation config
      desiredAccuracy: 0,
      distanceFilter: 5, // was 10
      stationaryRadius: 25, //never under 20
      locationUpdateInterval: 1000,
      fastestLocationUpdateInterval: 1000,
      // Activity Recognition config
      activityType: 'OtherNavigation', //or Fitness
      activityRecognitionInterval: 5000,
      stopTimeout: 5,
      heartbeatInterval: 1000,

      // Application config
      debug: false,
      stopOnTerminate: false,
      startOnBoot: false,
      preventSuspend: true,
      // HTTP / SQLite config
      url: 'http://posttestserver.com/post.php?dir=cordova-background-geolocation',
      method: 'POST',
      autoSync: true,
      maxDaysToPersist: 1,
      headers: {
        "X-FOO": "bar"
      },
      params: {
        "auth_token": "maybe_your_server_authenticates_via_token_YES?"
      }
    };
    var mapOptions = {
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: true,
      fullscreenControl: false
    };
    var mapStyles = [
      {
        stylers: [
          {hue: "#808080"},
          {saturation: -100},
          {lightness: -30}
        ]
      }, {
        featureType: "road.local",
        elementType: "geometry",
        stylers: [
          {saturation: -20},
          {visibility: "simplified"},
          {lightness: 100}
        ]
      }, {
        featureType: "road",
        elementType: "labels",
        stylers: [
          {visibility: "on"}
        ]
      },
      {
        featureType: "landscape.man_made",
        elementType: "labels",
        stylers: [
          {saturation: -20},
          {visibility: "simplified"}
        ]
      }
    ];

    // Our user variable
    var storage = window.localStorage;
    var settings = {};
    var displayUnit = {};
    settings.unit = "imperial";
    settings.inRad = 15;
    settings.exRad = 15;
    settings.fgFreq = 1000; // in ms
    settings.bgFreq = 1000; // in ms
    settings.timeoutDuration = 4000; // in ms
    settings.localServer = true;
    settings.autoPauseMode = false;
    settings.autoStartMode = false;
    settings.debugMode = true;
    settings.recoveryMode = false;
    settings.bluetoothMode = true;
    settings.autoShareToStrava = true;
    settings.hidePriceList = true;

    return {

      // Return the current username
      getUnit: function () {
        return settings.unit;
      },
      getbgLocationSettings: function () {
        return bgLocationSettings;
      },
      getMapOptions: function () {
        return mapOptions;
      },
      getMapStyles: function () {
        return mapStyles;
      },
      isMobile: function () {
        var output;
        if (
          ionic.Platform.platform() == "macintel" ||
          ionic.Platform.platform().indexOf("Linux") != -1 ||
          ionic.Platform.platform() == "Windows"
        ) {
          output = false;
        } else {
          output = true;
        }
        console.log(">>Ismobile> " + ionic.Platform.platform() + output);
        return output;
      },
      getDisplayUnit: function (unit) {
        if (unit == "metric") {
          displayUnit.distance = " km";
          displayUnit.speed = " km/h";
          displayUnit.elevation = " m";
          displayUnit.power = " W";
        } else {
          displayUnit.distance = " mi";
          displayUnit.speed = " mi/h";
          displayUnit.elevation = " ft";
          displayUnit.power = " W";
        }
        return displayUnit;
      },

      // Return the current email
      setUnit: function (val) {
        settings.unit = val;
      },

      resetlocal: function () {
        console.log(">resetlocal()");
        storage.setItem("settings", null);
      },

      reset: function () {
        storage.setItem("settings", null);
        settings.unit = "imperial";
        settings.inRad = 15;
        settings.exRad = 15;
        settings.fgFreq = 1000; // in ms
        settings.bgFreq = 1000; // in ms
        settings.timeoutDuration = 4000; // in ms
        settings.localServer = true;
        settings.debugMode = true;
        settings.autoPauseMode = true;
        settings.autoStartMode = true;
        settings.publishToStrava = false;
        settings.bluetoothMode = true;
      },

      localsave: function (val) {
        console.log(">localsave()");
        storage.setItem("settings", JSON.stringify(val));
        settings = angular.copy(val);
        out = storage.getItem("settings");
        console.dir(storage);
      },

      getServiceSettings: function () {
        console.log(">getServiceSettings()");
        return settings;
      },

      getLocalSettings: function () {
        console.log(">getLocalSettings()");
        //console.log(JSON.parse(storage.getItem("settings")));
        return JSON.parse(storage.getItem("settings"));
      },

      saveSettings: function (userID, getLocalSettings) {
        console.log(" >service saveSettings() " + userID + " - " + getLocalSettings);

        // Request the server to try to save the user settings
        $http.post(server.url + ":" + server.port + '/saveSettings', {saveSettings: getLocalSettings, userID: userID}).then(
          function (response) {
            console.log(" success " + response);
          }, function (response) {
            console.log(" fail" + response);
          }
        );
      },
      getSettingsDB: function () {
        console.log(" >service saveSettings()");
        var deferred = $.Deferred();
        // Request the server to try to save the user settings
        $http.post(server.url + ":" + server.port + '/getSettings', {userID: UserService.getUserId()}).then(
          function (response) {
            console.log(" success " + response);
            // successFct(response.data);
            deferred.resolve(response.data);
          }, function (err) {
            var err = new Error("Fail to fetch data");
            // errorFct();
            deferred.reject(err);
          }
        );
        return deferred.promise();
      },

      getSettings: function () {
        UtilitiesService.log("SERVICEDEBUG", ">getSettings()");
        var output = {};
        var local = storage.getItem("settings");
        UtilitiesService.log("SERVICEDEBUG", ">>getLocalSettings> storage.getItem('settings')");
        if (local != null) {
          UtilitiesService.log("SERVICEDEBUG", ">>get from local storage");
          var output = JSON.parse(storage.getItem("settings"));

        } else {
          UtilitiesService.log("SERVICEDEBUG", ">>get from settings (no local storage yet)");
          output = settings;
        }
        //console.dir(output);
        return output;
      }

    };
  })
  .factory('GPSService', function (UtilitiesService,SettingService) {


    var bgGeo = window.BackgroundGeolocation;
    var onListener;
    return {
      getBgGeo: function () {
        return bgGeo;
      },
      // Return the current username
      killBgGeo: function () {
        bgGeo = null;
      },
      configureBgGeo: function () {
        bgGeo = window.BackgroundGeolocation;
        bgGeo.configure(SettingService.getbgLocationSettings(), function (state) {
          // This callback is executed when the plugin is ready to use.
          UtilitiesService.log("DEBUG", 'BackgroundGeolocation ready: ', state);
          if (!state.enabled) {
            bgGeo.start();
          }
        });
      },
      removeEvents: function (callbackFn,failureFn) {
        UtilitiesService.log("GPS", 'removeEvents  ');
        bgGeo.removeListeners(callbackFn,failureFn);
        //bgGeo.removeListeners();
        //callbackFn = null;
        //failureFn = null;

      },
      setEventsPlay: function (callbackFn,failureFn) {
        UtilitiesService.log("GPS", 'setEventsPlay');
        //bgGeo.removeListeners();
        bgGeo.on('location', callbackFn, failureFn);
        //callbackFn = null;
        //failureFn = null;
      },
      setEventsRecord: function (callbackFn,failureFn) {
        UtilitiesService.log("GPS", 'setEventsRecord');
        //bgGeo.removeListeners();
        bgGeo.on('location', callbackFn, failureFn);
        //callbackFn = null;
        //failureFn = null;
      },
      startBgGeo: function () {
        bgGeo.start();
        bgGeo.changePace(true);
      },
      stopBgGeo: function () {
        bgGeo.stop();

      }


    };
  });
