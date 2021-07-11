package com.sliderdemo;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Environment;

import android.text.TextUtils;
import android.util.Base64;
import android.webkit.MimeTypeMap;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.core.content.FileProvider;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;




import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;



public class MyNativeModule extends ReactContextBaseJavaModule {
    public static final String REACTCLASSNAME = "MyNativeModule";
    private Context mContext;


    public MyNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
    }




    //定义发送事件的函数
    public  void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params)
    {
        System.out.println("reactContext="+reactContext);

        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName,params);
    }


    //定义发送事件的函数
    public  void sendEvent2(ReactContext reactContext, String eventName, @Nullable WritableArray params)
    {
        System.out.println("reactContext="+reactContext);

        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName,params);
    }

    /**
     * 必须重写该方法 该方法的返回值就是js中调用的民称
     * @return
     */
    @Override
    public String getName() {
        return REACTCLASSNAME;
    }

    /**
     * 必须添加反射注解不然会报错
     * 这个方法就是ReactNative将要调用的方法，会通过此类名字调用
     * @param msg
     */
    @ReactMethod
    public void callNativeMethod(String msg) {
        Toast.makeText(mContext, msg, Toast.LENGTH_SHORT).show();
        //startActivityForResult(myIntent, 1);
    }
















    /**
     * 异步线程下载图片
     *
     */
    class Task extends AsyncTask<String, Integer, Bitmap>{

        protected Bitmap doInBackground(String... params) {
            Bitmap bitmap=GetImageInputStream((String)params[0]);
            return bitmap;
        }

        protected void onPostExecute(Bitmap result) {
            super.onPostExecute(result);
            ReactApplicationContext context = getReactApplicationContext();
            Activity activity = context.getCurrentActivity();
            savePicture(activity,context,bitmapToBase64(result));

        }

    }

    /**
     * 获取网络图片
     * @param imageurl 图片网络地址
     * @return Bitmap 返回位图
     */
    public Bitmap GetImageInputStream(String imageurl){
        URL url;
        HttpURLConnection connection=null;
        Bitmap bitmap=null;
        try {
            url = new URL(imageurl);
            connection=(HttpURLConnection)url.openConnection();
            connection.setConnectTimeout(6000); //超时设置
            connection.setDoInput(true);
            connection.setUseCaches(false); //设置不使用缓存
            InputStream inputStream=connection.getInputStream();
            bitmap=BitmapFactory.decodeStream(inputStream);
            inputStream.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return bitmap;
    }



    /**
     * base64转为bitmap
     * @param imageurl
     * @return
     */
    public static Bitmap base64ToBitmap(String imageurl) {
        if(imageurl.startsWith("data:image/png;base64")) {
            imageurl = imageurl.replace("data:image/png;base64,", "");
            byte[] bytes = Base64.decode(imageurl, Base64.DEFAULT);
            return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        }else if(imageurl.startsWith("data:image/jpg;base64")) {
            imageurl = imageurl.replace("data:image/jpg;base64,", "");
            byte[] bytes = Base64.decode(imageurl, Base64.DEFAULT);
            return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        }else {
            byte[] bytes = Base64.decode(imageurl, Base64.DEFAULT);
            return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        }

    }


    /**
     *  切割图片
     * @param base64Imageurl 网络图片地址
     */
    @ReactMethod
    public void android_CropImage(String base64Imageurl){
        Bitmap bitmap=  base64ToBitmap(base64Imageurl);
        WritableArray array = Arguments.createArray();
        // int width = bitmap.getWidth();
        // int height = bitmap.getHeight();
        // int pieceWidth = width / 10;
        // int pieceHeight = height / 2;
        int pieceWidth = 20;
        int pieceHeight = 50;
        for(int i=0;i<20;i++){
            Bitmap  bitmap1 = Bitmap.createBitmap(bitmap, i<10?i*20:(i-10)*20, i<10?0:50,
                    pieceWidth, pieceHeight);
            String str=bitmapToBase64(bitmap1);
            array.pushString(str);
        }
        sendEvent2((ReactContext) mContext, "CropImages", array); 


    }





    /**
     *  保存图片
     * @param imageurl 网络图片地址
     */
    @ReactMethod
    public void android_DownloadSaveImage(String imageurl){

        if(imageurl.startsWith("data:image/png;base64")){
            imageurl = imageurl.replace("data:image/png;base64,","");
            byte[] bytes = Base64.decode(imageurl, Base64.DEFAULT);

            ReactApplicationContext context = getReactApplicationContext();
            Activity activity = context.getCurrentActivity();
            savePicture(activity,context,bitmapToBase64(BitmapFactory.decodeByteArray(bytes, 0, bytes.length)));

        }else if(imageurl.startsWith("data:image/jpg;base64")){
            imageurl = imageurl.replace("data:image/jpg;base64,","");
            byte[] bytes = Base64.decode(imageurl, Base64.DEFAULT);

            ReactApplicationContext context = getReactApplicationContext();
            Activity activity = context.getCurrentActivity();
            savePicture(activity,context,bitmapToBase64(BitmapFactory.decodeByteArray(bytes, 0, bytes.length)));

        }else {
            new Task().execute(imageurl);
        }


//        new Task().execute(imageurl);

    }




    /**
     *  保存图片
     * @param Url base64的图片字符串
     */
    @ReactMethod
    public void android_SaveImage(String Url){


        try {
            ReactApplicationContext context = getReactApplicationContext();
            Activity activity = context.getCurrentActivity();
            savePicture(activity,context,Url);

        } catch (Exception e) {
            e.printStackTrace();

        }

    }

    /*
     * bitmap转base64
     * */
    private static String bitmapToBase64(Bitmap bitmap) {
        String result = null;
        ByteArrayOutputStream baos = null;
        try {
            if (bitmap != null) {
                baos = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.JPEG, 100, baos);

                baos.flush();
                baos.close();

                byte[] bitmapBytes = baos.toByteArray();
                result = Base64.encodeToString(bitmapBytes, Base64.DEFAULT);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (baos != null) {
                    baos.flush();
                    baos.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return result;
    }


    public boolean savePicture( Activity activity,Context context, String base64DataStr) {
        String base64Str = "";
        // 1.去掉base64中的前缀
        if (base64DataStr.contains("data:image/")) {
            base64Str = base64DataStr.substring(base64DataStr.indexOf(",") + 1, base64DataStr.length());
        } else {
            base64Str = base64DataStr;
        }
        // 首先保存图片
        File appDir = new File(Environment.getExternalStorageDirectory(), "AppPic");// "abc":图片保存的文件夹的名称
        if (!appDir.exists()) {
            appDir.mkdir();
        }
        // 2.拼接图片的后缀，根据自己公司的实际情况拼接，也可从base64中截取图片的格式。
        String imgName = System.currentTimeMillis() + ".png";
        File fileTest = new File(appDir, imgName);
        // 3. 解析保存图片
        byte[] data = Base64.decode(base64Str, Base64.DEFAULT);

        for (int i = 0; i < data.length; i++) {
            if (data[i] < 0) {
                data[i] += 256;//调整异常数据
            }
        }
        OutputStream os = null;
        try {
            os = new FileOutputStream(fileTest);
            os.write(data);
            os.flush();
            os.close();



            // 4. 其次通知系统刷新图库
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {

                    WritableMap event = Arguments.createMap();
                    event.putBoolean("saveState",true);
                    sendEvent((ReactContext) mContext, "SaveQrCodePhoto",event);
                   // Toast.makeText(context, "已保存到手机图库", Toast.LENGTH_SHORT).show();
                    // 最后通知图库更新
                    context.sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, Uri.fromFile(fileTest)));

                }
            });

            return true;
        } catch (FileNotFoundException e) {
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                   // Toast.makeText(context, "请检查存储权限", Toast.LENGTH_SHORT).show();
                    WritableMap event = Arguments.createMap();
                    event.putBoolean("saveState",false);
                    sendEvent((ReactContext) mContext, "SaveQrCodePhoto",event);
                }
            });
            e.printStackTrace();
            return false;
        } catch (IOException e) {

            e.printStackTrace();
            return false;
        }
    }



   
  

}