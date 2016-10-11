//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        //当前页数
        this.pageNumCurrent = 0;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 翻页函数,在画场景中调用
     */
    p.pageTurningBitmap = function (pageArray, pageNumAll, pageText) {
        var _this = this;
        var distance = 0;
        var stageYBeforeMove = 0;
        var stageYAfterMove = 0;
        for (var i = 0; i < pageArray.length; i++) {
            pageArray[i].addEventListener(egret.TouchEvent.TOUCH_BEGIN, function (e) {
                console.log("Y:" + e.stageY);
                stageYBeforeMove = e.stageY;
            }, this);
            pageArray[i].addEventListener(egret.TouchEvent.TOUCH_END, function (e) {
                console.log("move to Y:" + e.stageY);
                stageYAfterMove = e.stageY;
                distance = stageYBeforeMove - stageYAfterMove;
                //往后翻
                if (distance > 0) {
                    //var pageToNum = this.pageNumCurrent + 1;
                    //console.log("现在开始往后翻，翻前页" + this.pageNumCurrent + "翻后页：" + pageToNum);
                    _this.pageTurningDetermine(pageNumAll, distance, pageArray[_this.pageNumCurrent], pageArray[_this.pageNumCurrent + 1], pageText[_this.pageNumCurrent], pageText[_this.pageNumCurrent + 1]);
                }
                else {
                    //var pageNowNum = this.pageNumCurrent - 1;
                    //console.log("现在开始往前翻，翻前页" + this.pageNumCurrent + "翻后页" + pageNowNum);
                    _this.pageTurningDetermine(pageNumAll, distance, pageArray[_this.pageNumCurrent], pageArray[_this.pageNumCurrent - 1], pageText[_this.pageNumCurrent], pageText[_this.pageNumCurrent - 1]);
                }
            }, this);
        }
    };
    /**
     *两个参数为before是当前页，after是想要翻到的页数，判断要怎么翻页
     */
    p.pageTurningDetermine = function (pageNumAll, moveDistance, pictureBeforeMove, pictureAfterMove, textBeforeMove, textAfterMove) {
        if (moveDistance > 300 && this.pageNumCurrent == pageNumAll) {
            alert("最后一页不能往后翻");
        }
        else if (moveDistance < -300 && this.pageNumCurrent == 0) {
            alert("第一页不能往前翻");
        }
        else if (moveDistance > -300 && moveDistance < 300) {
            this.rollingPages(pictureBeforeMove, pictureAfterMove, moveDistance);
        }
        else if (moveDistance < -300 && this.pageNumCurrent != 0) {
            //alert("中间的页往前翻");
            this.showText(textBeforeMove, 0, textBeforeMove.x, textBeforeMove.y + 10);
            this.pageTurningTween(pictureBeforeMove, pictureAfterMove);
            this.showText(textAfterMove, 1, textAfterMove.x, textAfterMove.y - 10);
            if (pictureAfterMove.y == 1136 || pictureAfterMove.y == 0 || pictureAfterMove.y == -1136) {
                this.pageNumCurrent--;
            }
            console.log("翻之后，当前页坐标" + pictureBeforeMove.y + "要翻到的y坐标" + pictureAfterMove.y);
        }
        else if (moveDistance > 300 && this.pageNumCurrent != pageNumAll) {
            //alert("中间的页往后翻");
            console.log("翻前，当前页坐标" + pictureBeforeMove.y + "要翻到的y坐标" + pictureAfterMove.y);
            this.showText(textBeforeMove, 0, textBeforeMove.x, textBeforeMove.y + 10);
            this.pageTurningTween(pictureBeforeMove, pictureAfterMove);
            this.showText(textAfterMove, 1, textAfterMove.x, textAfterMove.y - 10);
            //防止动画动到一半还改变了页数
            if (pictureAfterMove.y == 1136 || pictureAfterMove.y == 0 || pictureAfterMove.y == -1136) {
                this.pageNumCurrent++;
            }
        }
        console.log("page:" + this.pageNumCurrent);
    };
    /**
     * 滚动页面，小于300都是没翻动的
     */
    p.rollingPages = function (pageBeforeMove, pageAfterMove, moveDistance) {
        var pageAfterTween = egret.Tween.get(pageAfterMove);
        var pageBeforeTween = egret.Tween.get(pageBeforeMove);
        var tempTo = pageBeforeMove.y - moveDistance;
        var tempOri = pageBeforeMove.y;
        var tempToAf = pageAfterMove.y - moveDistance;
        var tempOriAf = pageAfterMove.y;
        pageBeforeTween.to({ y: tempTo }, 300);
        pageAfterTween.to({ y: tempToAf }, 300);
        pageBeforeTween.to({ y: tempOri }, 300);
        pageAfterTween.to({ y: tempOriAf }, 300);
    };
    /**
     * 实现翻页,pageBeforeMove为当前页，pageAfterMove为想要翻到的页
     */
    p.pageTurningTween = function (pageBeforeMove, pageAfterMove) {
        var pageAfterTween = egret.Tween.get(pageAfterMove);
        var pageBeforeTween = egret.Tween.get(pageBeforeMove);
        //如果当前页y=0,要翻到的页为-1136，则为往前翻，当前页翻后坐标为1136,翻到页y=0
        //如果当前页y=0,要翻到的页为1136,则为往后翻,当前页翻后-1136，翻到页y=0
        //后
        if (pageAfterMove.y == (pageBeforeMove.y + 1136)) {
            var tempTo = pageBeforeMove.y - 1136;
            pageBeforeTween.to({ y: tempTo }, 500);
        }
        else if (pageAfterMove.y == (pageBeforeMove.y - 1136)) {
            var tempTo = pageBeforeMove.y + 1136;
            pageBeforeTween.to({ y: tempTo }, 500);
        }
        pageAfterTween.to({ y: 0 }, 500);
        /*        if (pageAfterMove.y == 1136) {
                    pageAfterTween.to({ y: 0 }, 500);
                } else if (pageAfterMove.y == 0) {
                    pageAfterTween.to({ y: 1136 }, 500);
                }*/
    };
    /**
     * text:想要变化的文字，toAlpha:所变到的alpha值，toX：去往的X坐标，toY：去往的Y坐标
     */
    p.showText = function (text, toAlpha, toX, toY) {
        var tww = egret.Tween.get(text);
        tww.to({ "alpha": toAlpha, x: toX, y: toY }, 700);
    };
    // egret.TouchEvent.TOUCH_BEGIN
    //20160928Begin
    /*var tween = egret.Tween.get(icon);
    tween.to({x:100}, 2000).to({y:200}, 2000).call(function(){
        //alert("aaa")
    },this).to({x:26, y:33}, 20);*/
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        //加载第一张图片
        var sky = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;
        sky.touchEnabled = true;
        //黑框部分
        var topMask = new egret.Shape();
        topMask.graphics.beginFill(0x000000, 0.5);
        topMask.graphics.drawRect(0, 0, stageW, 172);
        topMask.graphics.endFill();
        topMask.y = 33;
        this.addChild(topMask);
        //Egret图标
        var icon = this.createBitmapByName("egret_icon_png");
        this.addChild(icon);
        icon.x = 26;
        icon.y = 33;
        //pageTurning(pageNumCurrent);
        //2016touch
        /*icon.touchEnabled = true;
        icon.addEventListener(egret.TouchEvent.TOUCH_BEGIN,()=>{
            alert(1111);
        },this);*/
        var line = new egret.Shape();
        line.graphics.lineStyle(2, 0xffffff);
        line.graphics.moveTo(0, 0);
        line.graphics.lineTo(0, 117);
        line.graphics.endFill();
        line.x = 172;
        line.y = 61;
        this.addChild(line);
        /*var colorLabel = new egret.TextField();
        colorLabel.textColor = 0xffffff;
        colorLabel.width = stageW - 172;
        colorLabel.textAlign = "center";
        colorLabel.text = "Hello Egret";
        colorLabel.size = 24;
        colorLabel.x = 172;
        colorLabel.y = 80;
        this.addChild(colorLabel);*/
        var textfield = new egret.TextField();
        this.addChild(textfield);
        textfield.alpha = 0;
        textfield.width = stageW - 172;
        textfield.textAlign = egret.HorizontalAlign.CENTER;
        textfield.size = 24;
        textfield.textColor = 0xffffff;
        textfield.x = 172;
        textfield.y = 135;
        this.textfield = textfield;
        var nameText = new egret.TextField();
        nameText.text = "My name is WangYiran";
        nameText.textColor = 0xFFFFFF;
        nameText.alpha = 1;
        nameText.size = 24;
        nameText.x = 280;
        nameText.y = 80;
        this.addChild(nameText);
        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        RES.getResAsync("description_json", this.startAnimation, this);
        //第二张图片
        var sky2 = this.createBitmapByName("bg_2_jpg");
        this.addChild(sky2);
        sky2.width = stageW;
        sky2.height = stageH;
        sky2.x = 0;
        sky2.y = 1136;
        sky2.touchEnabled = true;
        //第二页的文字应该放在第二页图片上加载
        var nameText2 = new egret.TextField();
        nameText2.text = "我叫汪一然.\n\n"
            + "就读于北京工业大学14届数媒.\n\n"
            + "I dont like 编程.\n\n"
            + "Thats all.\n\n"
            + "Thank you.";
        this.addChild(nameText2);
        nameText2.textColor = 0xFFFFFF;
        nameText2.alpha = 0;
        nameText2.x = 50;
        nameText2.y = 600;
        //后面的图片会覆盖前面的
        var sky3 = this.createBitmapByName("bg_3_jpg");
        this.addChild(sky3);
        sky3.width = stageW;
        sky3.height = stageH;
        sky3.x = 0;
        sky3.y = 1136;
        sky3.touchEnabled = true;
        var nameText3 = new egret.TextField();
        nameText3.text = "END";
        this.addChild(nameText3);
        nameText3.textColor = 0xFFFFFF;
        nameText3.alpha = 0;
        nameText3.textAlign = egret.HorizontalAlign.CENTER;
        nameText3.x = 320;
        nameText3.y = 568;
        nameText3.size = 128;
        var pageNumAll = 2;
        //总页面数写作2其实是3页
        var pageArray = [sky, sky2, sky3];
        var textArray = [nameText, nameText2, nameText3];
        this.pageTurningBitmap(pageArray, pageNumAll, textArray);
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    p.startAnimation = function (result) {
        var self = this;
        var parser = new egret.HtmlTextParser();
        var textflowArr = [];
        for (var i = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }
        var textfield = self.textfield;
        var count = -1;
        var change = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];
            self.changeDescription(textfield, lineArr);
            var tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, self);
        };
        change();
    };
    /**
     * 切换描述内容
     * Switch to described content
     */
    p.changeDescription = function (textfield, textFlow) {
        textfield.textFlow = textFlow;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
//# sourceMappingURL=Main.js.map