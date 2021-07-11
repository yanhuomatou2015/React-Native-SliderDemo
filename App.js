import React,{Component} from 'react';
import {
  StyleSheet,
  Platform,
  Text, 
  DeviceEventEmitter,
  Image,
  TouchableOpacity,
  View,
  FlatList,
  NativeModules,
  ActivityIndicator,
  PanResponder,
  Animated,
  Easing,
  Dimensions,
  } from 'react-native';
import ImageEditor from '@react-native-community/image-editor';
import Toast from 'react-native-root-toast'


const generateSlidingStyles = (
  iconUri,
  buttonColor,
  borderColor ,
  indicatorColor,
) => ({
  icon: <Image style={{width:25,height:25}} resizeMode='contain' source={iconUri}/>,
  buttonColor,
  borderColor,
  indicatorColor,
})

const slidingStyles = {
  READY: generateSlidingStyles(require('./slider_rightarrow.png'), '#1991fa', '#e4e7eb', '#e4e7eb'),
  MOVING: generateSlidingStyles(require('./slider_rightarrow.png'),  '#1991fa', '#e4e7eb', '#d1e9fe'),
  VERIFY_PASS: generateSlidingStyles(require('./slider_right.png'), 'white', '#52ccba', '#d2f4ef'),
  VERIFY_FAIL: generateSlidingStyles(require('./slider_error.png'),'white',   '#f57a7a', '#fce1e1')
}



class App extends Component {
    
  constructor(props){
    super(props);
    this.state={
      //大图bse64
      small:'data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAoACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDsLvT9OjmmldVUbFxtUAAk/qegx7V55qejWlzDf2kKRrKHEsRBxgjg/wCNTnxXL4knezGbaPzS6R7hubjaB1xT7PSNQtjNeDY+8MEySexxmvBx7lHEOSZ0UknBI5k3r6bpUizLJBfQPvXAwJV7g98HvXU6fp+n+KdKXUbaBMuQk8fOUIIyMehPNchPcPrt9HDIWPmpgJkEqw6LzR4L16Xwx4mENwSlnct5c57LzgN+B/SvbwVduKU0cVen1iWX+Ht/dbmiCJCrPyDk/exj8qK9i8pUB2EYf5uO+ec0V6P1Wm9Ucf1ma0PEJ7id9cDzMsMLnYxjGQo/DP8AM16Hp80sGgDzMnzCCueuwdTXPeK9JWF59Q1C4U+cxWBM5dj29ABWzper2+r+GriR4j5lvHs6HKKo6n618xmVGc1eKPZw0ltc4ONltfE0UkuYSswDMB2zwa7Txz4SgGjm9tIEVgFZtgwNoXt9a861q5jfUmjQECMld3cjrXvOhsdT8BWjupEotBhm/vBeDXpYJN07M56tk7nP+Adal1nw+tvK5e7tP3b56lf4T+VFcl4SaTw/8RLeFmIiuiY2yMAg9P1or0aWIcVyvock6CbuWviBdre6raRRHzIoXy74PzHPQVl6LPNYeIdQ0+3X7QLyExlVGAeMkj6UUVxOClUaZ0xdldFU+HpotVa4u4JEs88SSjZv49K9p8Lf6P4WsIwuAsQxg9R2/nRRSwsUqzQqrvG55z8R/NsfEtjeWihDDGr5HQNuzRRRWtaKU2KHwn//2Q==',
      //小图base64
      normal:'data:image/jpg;base64,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',
      array:[7,6,19,9,1,3,17,2,0,4,18,13,10,11,12,14,5,8,16,15],//重组规则
      smallMarginTop:23,// 小图离大图顶部的距离
      height:100,//大图高
      width:200,//大图宽
      sortedImgArray:[],
      openLocalValidation:true,//开启本地验证
      offsetXAnim: new Animated.Value(0),
      slideStatus: slidingStyles.READY,
      moving: false,     
      verifying: false, //  true表示正在验证中，false表示验证结束
      result: null,
      lastResult: false,
      pieceOffsetX: 40,
      allowableOffsetError: 3,//允许误差范围
      smallWidth: 40,//小图宽
      smallHeight:40,//小图高
      showRefresh: true,
      slideTips:'滑动箭头验证',
    };
    this._panResponder = PanResponder.create({
      // 要求成为响应者:
      onStartShouldSetPanResponder: this.hanldeShouldBeResponder,
      onStartShouldSetPanResponderCapture: this.hanldeShouldBeResponder,
      onMoveShouldSetPanResponder: this.hanldeShouldBeResponder,
      onMoveShouldSetPanResponderCapture: this.hanldeShouldBeResponder,
  
      onPanResponderGrant: this.handlePanResponderGrant, // 开始滑动
      onPanResponderMove: this.handlePanResponderMove(), // 滑动中
      onPanResponderRelease: this.handlePanResponderRelease // 滑动结束
    })
   
 }




hanldeShouldBeResponder = () => this.state.lastResult !== true && !this.state.moving

handlePanResponderGrant = (event, gestureState) =>{
  //console.log('手指按下,x方向的距离:'+gestureState.dx+'   ,timestamp:'+event.nativeEvent.timestamp)
  this.setState({
    moving: true,
    result: null,
    slideStatus: slidingStyles.MOVING,
  })
}
  
handlePanResponderMove = (event, gestureState) => {
 const { offsetXAnim ,width, smallWidth} = this.state
 const maxMoving = width - smallWidth
 return Animated.event([null, { dx: offsetXAnim }], {
   // 限制滑块，不让滑出边界
   listener: (event, gestureState) => {//可选的异步监听函数
   // console.log('滑动过程中x方向的距离:'+gestureState.dx+'   ,timestamp:'+event.nativeEvent.timestamp)
    if (gestureState.dx < 0) {
       offsetXAnim.setValue(0)
     } else if (gestureState.dx > maxMoving) {
       offsetXAnim.setValue(maxMoving)
     }
   }
 })
}

handlePanResponderRelease =  (event, gestureState) => {
  const offset = gestureState.dx
  //console.log('松开手指，x方向总共滑动的距离:'+gestureState.dx+'   ,timestamp:'+event.nativeEvent.timestamp)
    if (this.state.openLocalValidation) { //本地验证
      const { pieceOffsetX, allowableOffsetError } = this.state
      const minOffsetX = pieceOffsetX - allowableOffsetError
      const maxOffsetX = pieceOffsetX + allowableOffsetError
      offset >= minOffsetX && offset <= maxOffsetX
        ? this.handleVerifyPassed() //验证成功
        : this.handleVerifyFailed() //验证失败
    } else {//服务器验证
      
      }
  
}

//刷新滑块图片
createSliderCode(){
  this.state.offsetXAnim.setValue(0)
  this.setState({
    offsetXAnim: this.state.offsetXAnim,
    slideStatus: slidingStyles.READY,
    moving: false,     
    verifying: false,
    result: null,
    lastResult: false,
 
   })
}



//滑块验证成功
handleVerifyPassed = () => {
  Toast.show('验证成功', {
    position: Toast.positions.CENTER,
    backgroundColor:'#FFFFFF',
    textColor:'black',
    duration: 3000,
  })
  this.setState({
    moving: false,
    result: true,
    slideStatus: slidingStyles.VERIFY_PASS,
    lastResult: true,
  })
}

//滑块验证失败
handleVerifyFailed = () => {
  Toast.show('验证失败', {
    position: Toast.positions.CENTER,
    backgroundColor:'#FFFFFF',
    textColor:'black',
    duration: 3000,
  })
  this.setState({
    result: false,
    slideStatus: slidingStyles.VERIFY_FAIL,
  })
  Animated.timing(this.state.offsetXAnim, {
    toValue: 0,
    delay:500,
    easing: Easing.linear
  }).start(() => {
    // 返回初始状态
    this.setState({
      slideStatus: slidingStyles.READY,
      moving: false,
      result: null,
      lastResult: false
    })
  })
}

componentWillMount(){
  console.disableYellowBox = true
  
}


componentDidMount() {


    if(Platform.OS=='android'){
      this._cropImage()
      DeviceEventEmitter.addListener('CropImages', (params)=> {
        this._picSplitCallBack(params)
        })
    }else{
      this._crop()
    }
  

  if(Platform.OS=='android'){
    DeviceEventEmitter.addListener('CropImages', (params)=> {
      //console.log('回调结果====>>>'+params);
      this._picSplitCallBack(params)
      })
  }


}   

      _picSplitCallBack(params){
        if(params.length!=0){
          let counter=0
          let ArrData=[]
          for(let i=0;i<20;i++){
            
            counter++

            let base64Head=String(this.state.normal).split(',')[0]
            let obj={imgUri:base64Head+','+params[i],position:this.state.array[i]}
            ArrData.push(obj)
            if(counter==20){
              ArrData.sort((a,b)=>{
                return a['position']-b['position']
            })
            this.setState({
              sortedImgArray:ArrData,
            })
            }

          }
        // console.log('图片剪辑成功');
        }else{
          //console.log('图片剪辑成功');
        }
      }

    _cropImage(){
      
      if (Platform.OS === 'android'){
        
        NativeModules.MyNativeModule.android_CropImage(this.state.normal)
      }
    }

    async _crop() {
      let counter=0
      let ArrData=[]
      for(let i=0;i<20;i++){
      try {
        let corpImgURI = await ImageEditor.cropImage(
          this.state.normal, 
          {
            offset: {x:i<10?i*20:(i-10)*20, y: i<10?0:50},
            size: {width: 20, height: 50},
            resizeMode: 'contain',
            displaySize: {width: 20, height: 50},
        },
        );
        //console.log('图片剪辑成功'+i);
            counter++
            let obj={imgUri:corpImgURI,position:this.state.array[i]}
            ArrData.push(obj)
            if(counter==20){
              ArrData.sort((a,b)=>{
                return a['position']-b['position']
            })
            this.setState({
              sortedImgArray:ArrData,
            })
            }

      } catch (cropError) {
        //console.log('图片剪辑失败'+i+':    '+cropError);
      }
      }  
    }




  
  render() {
    
  
    
    return (


      <View style={styles.container}>

           <Text style={styles.titleStyle}>  
               滑块demo
         </Text>
         <View style={styles.messageOutStyle}>

      
        {this.state.sortedImgArray.length!=0?this.renderSliderView():null} 

         </View>

      </View>
    );
  }


   renderSliderView(){
     return(
      <View style={{ width: this.state.width, }}>
      <View
        style={[
          styles.puzzleContainer,
          {
            height: this.state.height,
            opacity: 1,
          },
         
        ]}
      >
          {/* 大图 */}

         <FlatList 
            style={styles.bigImageStyle}
            extraData={this.state}
               numColumns={10}
               scrollEnabled={false}
               keyExtractor={(item, index) => String(index)}
               renderItem={({item, index }) => {
                return(
                  <Image 
                    source={{ uri: item.imgUri }} 
                    style={{ width: 20,height: 50,}}
                    resizeMode='contain'/>
                )
               }}
               data={this.state.sortedImgArray} 
               showsHorizontalScrollIndicator = {false} 
               showsVerticalScrollIndicator = {false}  
               />  
        
        {/* 给小图加个滑动的动画 */}
        <Animated.View
          style={{
              position:'absolute',
              zIndex: 3,
              transform: [
                { translateX: this.state.offsetXAnim },
                { perspective: 1000 }
              ]
            }}
        >
            {/* 小图 */}
            <Image
              source={{uri:this.state.small}}
              style={{ width: this.state.smallWidth, height: this.state.smallHeight,marginTop:this.state.smallMarginTop }}
              resizeMode='contain'
            />
          
        </Animated.View>

      {/* 是否显示刷新按钮 */}
        {this.state.showRefresh ?
          <TouchableOpacity
            onPress={()=>{
             this.createSliderCode()
              
            }}
            activeOpacity={0.6}
            style={styles.refreshStyle}
            disabled={this.state.verifying}
          >
            <Image
              source={require('./slider_fresh.png')}
              style={{ width:25, height: 25,margin:5 }}
              resizeMode='contain'
            />
          </TouchableOpacity>
        :null}

      </View>


      {/* 底部拖动条 */}
      <View style={styles.slideBox}>
        <Animated.View
          style={[
            styles.slideIndicator,
            {
              width: this.state.offsetXAnim,
              borderColor: this.state.slideStatus.borderColor,
              backgroundColor: this.state.slideStatus.indicatorColor
            }
          ]}
        />

        <Animated.View
          style={[
            styles.slider,
            {
              width: this.state.smallWidth,
              backgroundColor: this.state.slideStatus.buttonColor,
              borderColor: this.state.slideStatus.borderColor,
              transform: [{ translateX: this.state.offsetXAnim }, { perspective: 1000 }]
            }
          ]}
           {...this._panResponder.panHandlers}
        >
          {/* 正在验证中，显示菊花在转 */}
          {this.state.verifying ? <ActivityIndicator color={this.state.slideStatus.indicatorColor} /> : this.state.slideStatus.icon}
        </Animated.View>
        {!this.state.moving && this.state.result === null && <Text style={styles.slideTips}>{this.state.slideTips}</Text>}
      </View>
      </View>


     )

   }






}






  





  const styles = StyleSheet.create({

    container: {
        backgroundColor:'transparent',
        flex:1,
        marginBottom:50,
        alignItems:'center',
        },
       titleStyle:{
         paddingVertical:15,
         fontSize:16,
         color:'black',
         textAlign:'center',
         backgroundColor:'#f4f6f0',
         width:Dimensions.get('window').width,
         marginBottom:20,
        },
          messageOutStyle:{
            marginHorizontal:15,
          },
          


    
      puzzleContainer: {
        width:200,
        height:100,
        elevation: 10, 
        backgroundColor: 'ghostwhite',
        shadowOffset: { width: 5, height: 5 },
        shadowColor: 'grey',
        shadowOpacity: 0.8,
        shadowRadius: 5
      },
      puzzleContainerEmbedded: {
        marginBottom: 20
      },
      bigImageStyle: {
        width: 200,
        height: 100,
        position:'absolute',
        zIndex:2,
      },
      
      refreshStyle: {
        position: 'absolute',
        right: 5,
        top: 1,
        zIndex: 3,
        backgroundColor: 'transparent'
      },
      slideBox: {
        width:200,
        height: 45,
        borderWidth: 1,
        borderColor: '#e4e7eb',
        backgroundColor: '#f7f9fa',
        marginTop:20,
      },
      slideIndicator: {
        height: 43,
        borderWidth: 1,
        borderRightWidth: 0
      },
      slider: {
        height: 43,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1
      },
      slideTips: {
        position: 'absolute',
        left: '40%',
        top: 13
      }
    
            



});

export default App;


