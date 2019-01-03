#!/usr/bin
# edit on 2015-05-09

# get arguments
type=$1

# define arguments
# dev tomcat path
# dev_tomcat_on='/Users/haw/taobao/TAE_Cloud_SDK/tae-dev/bin/startup.sh'
# dev_tomcat_off='/Users/haw/taobao/TAE_Cloud_SDK/tae-dev/bin/shutdown.sh'
# root=/Users/haw/taobao/TAE_Cloud_SDK/tae-dev/webapps/ROOT
# E:\DevTools\apache-tomcat-7.0.56
# dev_tomcat_on='/usr/local/opt/tomcat/libexec/bin/startup.sh'
# dev_tomcat_off='/usr/local/opt/tomcat/libexec/bin/shutdown.sh'
# root=/usr/local/opt/tomcat/libexec/webapps/ROOT
dev_tomcat_on='/Users/linyuanfeng/myCode/tool/apache-tomcat-8.5.12/bin/startup.sh'
dev_tomcat_off='/Users/linyuanfeng/myCode/tool/apache-tomcat-8.5.12/bin/shutdown.sh'
root='/Users/linyuanfeng/myCode/tool/apache-tomcat-8.5.12/webapps/ROOT'

psid=0
killpid() {
	tomcatps=`ps -ef | grep $1 | grep java`

	if [ -n '$tomcatps' ]; then
		psid=`echo $tomcatps | awk '{print $2}'`
	else
		psid=0
	fi
	echo $psid
	kill -9 $psid
}

# run tasks (dev, test, dist, service)
if [ "$type" = "-d" ]; then
	# build dev, run dev service 
	echo '正在启动开发服务....'

	gulp dev

	# 启动 webpack 开发服务
	# node webpack.config.dev.js

elif [ "$type" = "-s" ]; then

	rm -rf ./dist
	webpack -p --config webpack.config.js

	cp -rf WEB-INF ./dist
	cp -rf assets/images ./dist/assets
	cp favicon.ico ./dist

	rm -rf ./dist/WEB-INF/prototype
	gulp inject

# elif [ "$type" = "-s" ]; then
elif [ "$type" = "-dev" ]; then
	node webpack.config.dev.js
	
else
	echo 'please input the right cmd!!!'
fi
