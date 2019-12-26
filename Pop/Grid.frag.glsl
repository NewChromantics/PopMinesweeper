precision highp float;
varying vec2 uv;

uniform sampler2D Texture;
uniform sampler2D FontTexture;
uniform float2 GridSize;


void GetGridValue(out int NeighbourCount,out bool IsMine)
{
	float4 Sample = texture2D( Texture, uv );
	IsMine = (Sample.y > 0);
	NeighbourCount = int(floor(Sample.x * 256.0));
}

float Range(float Min,float Max,float Value)
{
	return (Value-Min) / (Max-Min);
}

float3 GetNormalYellowGreenBlue(float Normal)
{
	if ( Normal < 0.333 )
	{
		Normal = Range( 0, 0.333, Normal );
		return float3( 1-Normal, 1, 0 );
	}
	else if ( Normal < 0.666 )
	{
		Normal = Range( 0.333, 0.666, Normal );
		return float3( 0, 1, Normal );
	}
	else
	{
		Normal = Range( 0.666, 1.0, Normal );
		return float3( 0, 1-Normal, 1 );
	}
}

float2 GetFontUv(int Number,float2 LocalUv)
{
	float u = LocalUv.x;
	float v = (Number+LocalUv.y) / 10.0;
	return float2(u,v);
}

float3 GetNumberColour(int Number,float Max,float2 LocalUv)
{
	float3 Bg = float3(0.7,0.7,0.7);
	float3 Fg = float3(0,0,1);
	if ( Number == 0 )
		return Bg;
	
	
	//	todo: add border to LocalUv
	float2 FontUv = GetFontUv( Number, LocalUv );
	float FontSample = texture2D( FontTexture, FontUv ).x;
	return mix( Bg, Fg, FontSample );
	
	float Normal = float(Number) / Max;
	return GetNormalYellowGreenBlue(Normal);
}


void main()
{
	int NeighbourCount;
	bool IsMine;
	GetGridValue( NeighbourCount, IsMine );

	if ( IsMine )
	{
		gl_FragColor = float4(1,0,0,1);
	}
	else
	{
		float2 xy = uv * GridSize;
		float2 LocalUv = fract( xy );
		gl_FragColor = float4(LocalUv,0,1);
		
		gl_FragColor = float4( GetNumberColour(NeighbourCount,8,LocalUv), 1 );
		if ( NeighbourCount == 0 )
			gl_FragColor = float4( 0.7, 0.7, 0.7, 1 );
	}
	/*
	float4 Sample = texture2D( Texture, uv );
	Sample.x = Sample.x != 0 ? 1 : 0;
	Sample.y = Sample.y != 0 ? 1 : 0;
	//gl_FragColor = float4(uv,0,1);
	gl_FragColor = Sample;
	 */
	/*
	float2 FontUv = GetFontUv( 3, uv );
	gl_FragColor = texture2D( FontTexture, FontUv );
	 */
}


