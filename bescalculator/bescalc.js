var aylikKatkiPayi = 3000;
var yillikKatkiPayiArtisi = 0.1466;
var fonGetirisi = 0.4;
var devletKatkiPayi = 0.3;
var sonOnYillikOrtalamaEnflasyon = 0.1466;
var yil = 15;
var yillikOrtalamaEnflasyon = 0.1466;
var besteBulunulacakYilSayisi = 15;

function besHesapla(){
	try{
		document.getElementById("hata").value = "";
		validate();
		aylikKatkiPayi = document.getElementById("aylikKatkiPayi").value;
		yillikKatkiPayiArtisi = document.getElementById("yillikKatkiPayiArtisi").value/100;
		fonGetirisi = document.getElementById("fonGetirisi").value/100;
		devletKatkiPayi = document.getElementById("devletKatkiPayi").value/100;
		yillikOrtalamaEnflasyon = document.getElementById("yillikOrtalamaEnflasyon").value/100;
		besteBulunulacakYilSayisi = document.getElementById("besteBulunulacakYilSayisi").value;
		var sonuc = xYılSonraBestekiParaminHali(besteBulunulacakYilSayisi, aylikKatkiPayi, yillikKatkiPayiArtisi, fonGetirisi, devletKatkiPayi, yillikOrtalamaEnflasyon);
		document.getElementById("sonuc").value = "Toplam ödenen katkı payı: " + sonuc.toplamOdenenKatkiPayi + " TL." 
		+ "\n En son ödenen katkı payı: " + sonuc.sonKatkiPayi + " TL." +"\n BES içinde biriken toplam para: " + sonuc.birikenPara + " TL."
		+ "\n Ortalama tahmini enflasyon etkisi ile biriken paranın günümüzdeki alım gücü: " + sonuc.enflasyonEtkisiIleBuGunkuAlimGucu + " TL."
		
	}catch(e){
		document.getElementById("hata").value = e.message;
	}
}

function validate(){
	
}

function xYılSonraBestekiParaminHali(yil, aylikKatkiPayi, yillikKatkiPayiArtisi, fonGetirisi, devletKatkiPayi, sonOnYillikOrtalamaEnflasyon){
   var toplamOdenenKatkiPayi = 0;
   var sonKatkiPayi = aylikKatkiPayi;
   var birikenPara = 0;
   for(var i = 0; i < yil; i++){
       sonKatkiPayi = Math.pow((1 + yillikKatkiPayiArtisi), i) * aylikKatkiPayi;
       toplamOdenenKatkiPayi += sonKatkiPayi * 12;
       birikenPara = (birikenPara + sonKatkiPayi * 12) * (1+fonGetirisi);
       
   }
   birikenPara = birikenPara * (1 + devletKatkiPayi);
   var enflasyonEtkisiIleBuGunkuAlimGucu = birikenPara * (Math.pow((1 - sonOnYillikOrtalamaEnflasyon), yil));
   var sonuc = {
	   toplamOdenenKatkiPayi: Math.round(toplamOdenenKatkiPayi).toLocaleString(),
	   sonKatkiPayi: Math.round(sonKatkiPayi).toLocaleString(),
	   birikenPara: Math.round(birikenPara).toLocaleString(),
	   enflasyonEtkisiIleBuGunkuAlimGucu: Math.round(enflasyonEtkisiIleBuGunkuAlimGucu).toLocaleString()
   }
   console.log(" Toplam odenen katki payi:"+ toplamOdenenKatkiPayi + " Son katkı payı:" + sonKatkiPayi);
   console.log(yil + " yıl sonra BES biriken para: " + birikenPara);
   console.log("Enflasyon etkisi ile biriken paranın bugünkü alım gücü:" + enflasyonEtkisiIleBuGunkuAlimGucu);
   
   return sonuc;
}

