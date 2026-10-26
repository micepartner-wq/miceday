package kr.co.miceday.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final long EXIT_INTERVAL_MS = 2000;
    private long lastBackPressedAt = 0;

    // Closes the topmost open <dialog>; returns "true" if one was closed.
    private static final String CLOSE_DIALOG_JS =
        "(function(){var d=document.querySelectorAll('dialog[open]');"
            + "if(!d.length)return false;d[d.length-1].close();return true;})()";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                handleBack();
            }
        });
    }

    private void handleBack() {
        final WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView == null) {
            finish();
            return;
        }

        webView.evaluateJavascript(CLOSE_DIALOG_JS, result -> {
            if ("true".equals(result)) {
                return;
            }
            if (webView.canGoBack()) {
                webView.goBack();
                return;
            }
            long now = System.currentTimeMillis();
            if (now - lastBackPressedAt < EXIT_INTERVAL_MS) {
                finish();
            } else {
                lastBackPressedAt = now;
                Toast.makeText(this, "뒤로가기를 한 번 더 누르면 앱이 종료됩니다", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
