export ROLLBAR_POST_TOKEN=aaaabbbbccccddddeeeeffff00001111
sed -i '' 's/api.tidepool.org/dev-connect.sensotrend.fi\/tpapi/g' node_modules/tidepool-platform-client/tidepool.js
sed -i '' 's/uploads.tidepool.org/dev-connect.sensotrend.fi\/tpupload/g' node_modules/tidepool-platform-client/tidepool.js
sed -i '' 's/data.tidepool.org/dev-connect.sensotrend.fi\/tpdata/g' node_modules/tidepool-platform-client/tidepool.js

yarn package-mac





