package com.dreamstorestudios.bedtimewriter

import androidx.annotation.NonNull
import android.os.Bundle
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import com.facebook.appevents.AppEventsConstants
import com.facebook.appevents.AppEventsLogger
import com.facebook.FacebookSdk
import com.facebook.LoggingBehavior

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.dreamstorestudios.bedtimewriter.fb_logger";

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            CHANNEL
        ).setMethodCallHandler { call, result ->
            if (call.method == "configure") {
                configure()
                result.success(true);
            } else if (call.method == "custom") {
                val logger: AppEventsLogger = AppEventsLogger.newLogger(this)

                val params = Bundle()
                params.putString(AppEventsConstants.EVENT_PARAM_LEVEL, "my_level")
                logger.logEvent(AppEventsConstants.EVENT_NAME_ACHIEVED_LEVEL, 2.1, params)
            } else {
                result.notImplemented()
            }
        }
    }

    private fun configure(): Boolean {
        print("configure MainActivity.kt");
        FacebookSdk.setIsDebugEnabled(true);
        FacebookSdk.addLoggingBehavior(LoggingBehavior.APP_EVENTS);
        return true;
    }
}
