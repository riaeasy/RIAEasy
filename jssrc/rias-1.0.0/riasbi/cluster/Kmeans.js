
//RIAStudio Server Runtime(riass) in Rhino.

define([
	"rias",
	"rias/riasbi/riasbi"
], function(rias) {

	var riasType = "rias.riasai.cluster.Kmeans";
	var Kmeans = rias.declare(riasType, null,{

		_data: [],
		_k: 3,//质心数
		clusters: [],//结果簇

		constructor: function(params){
			this._params = params;
			if(rias.isArray(params.data)){
				this._data = params.data;
			}
			this._k = params.k < 1 ? 1 : params.k > this._data.length ? this._data.length : params.k;
		},

		//根据质心，决定当前数据点属于哪个簇
		_cluster: function(center, p){
			var d = this.distance(center[0], p),
				t,
				k = 0,//标示属于哪一个簇
				i;
			for(i = 1; i < this._k; i++){
				t = this.distance(center[i], p);
				if(t < d) {
					d = t;
					k = i;
				}
			}
			return k;
		},
		//计算给定簇集的距离和
		_delta: function(center, clusters){
			var d = 0,
				t,
				i, j, l;
			for (i = 0; i < this._k; i++){
				t = clusters[i];
				l = t.length;
				for (j = 0; j < l; j++){
					d += this.distance(center[i], t[j]);
				}
			}
			return d;
		},
		//用算术平均计算当前簇的质心
		center: function(cluster){
			var l = cluster.length,
				x = 0, y = 0,
				t = [0,0],
				i, j;
			for (i = 0; i < l; i++){
				x += cluster[i][0];
				y += cluster[i][1];
			}
			t[0] = x / l;
			t[1] = y / l;
			return t;
		},
		//计算两点间的欧式距离
		distance: function(a, b){
			return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
		},

		kmeans: function(){
			var data = this._data,
				clusters = this.clusters = [],//迭代簇，结果簇
				centers = [],//质心
				k = 0,//质心索引
				i;
			//初始化簇，并默认一开始将前k个元组的值作为k个簇的质心
			for(i = 0; i < this._k; i++){
				clusters.push([]);
				centers.push(data[i]);
			}
			//根据默认的质心给簇赋值
			for(i = 0; i < data.length; i++){
				k = this._cluster(centers, data[i]);
				clusters[k].push(data[i]);
			}
			//迭代
			var d0 = -1,
				d1 = this._delta(centers, clusters);
			while(Math.abs(d1 - d0) >= 1){ //当新旧质心距离和相差不到1表示质心不发生明显变化，完成迭代
				for (i = 0; i < this._k; i++){ //更新每个簇的质心
					centers[i] = this.center(clusters[i]);
				}
				d0 = d1;
				d1 = this._delta(centers, clusters);
				for (i = 0; i < this._k; i++){
					clusters[i] = [];
				}
				//根据新的质心获得新的簇
				for(i = 0; i < data.length; i++){
					k = this._cluster(centers, data[i]);
					clusters[k].push(data[i]);
				}
			}
		}

	});

	return Kmeans;

});

