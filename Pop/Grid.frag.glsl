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


#define Whitef		1.0
#define LightGreyf	0.8
#define MidGreyf	0.6
#define DarkGreyf	0.4
#define Blackf		0.0
#define White		float3(Whitef,Whitef,Whitef)
#define LightGrey	float3(LightGreyf,LightGreyf,LightGreyf)
#define MidGrey		float3(MidGreyf,MidGreyf,MidGreyf)
#define DarkGrey	float3(DarkGreyf,DarkGreyf,DarkGreyf)
#define Black		float3(Blackf,Blackf,Blackf)

float3 GetNumberColour(int Number,bool Pressed,float2 LocalUv)
{
	float3 HighOut = Pressed ? Black : White;
	float3 HighIn = Pressed ? DarkGrey : LightGrey;
	float3 LowOut = Pressed ? White : Black;
	float3 LowIn = Pressed ? LightGrey : DarkGrey;
	float3 Inside = MidGrey;
	float Border = 0.2;
	float InnerBorder = 0.4;
	//if ( !Pressed )
	{
		//if ( LocalUv.x < Border || LocalUv.y < Border )
		//	return LightGrey;
	}
	
	float3 FontColour = float3(0,0,1);
	LocalUv.x = mix( -Border, 1+Border, LocalUv.x);
	LocalUv.y = mix( -Border, 1+Border, LocalUv.y);
	/*
	if ( LocalUv.x < -Border/2.0 || LocalUv.y < -Border/2.0 )
		return HighOut;
	if ( LocalUv.x > 1+(Border/2.0) || LocalUv.y > 1+(Border/2.0) )
		return LowOut;
	 */
	if ( min(LocalUv.x,LocalUv.y) < 0.0 )
		return HighIn;
	if ( max(LocalUv.x,LocalUv.y) > 1.0 )
		return LowIn;

	LocalUv.x = mix( -InnerBorder, 1+InnerBorder, LocalUv.x);
	LocalUv.y = mix( -InnerBorder, 1+InnerBorder, LocalUv.y);
	if ( LocalUv.x < 0.0 || LocalUv.y < 0.0 )
		return Inside;
	if ( LocalUv.x > 1.0 || LocalUv.y > 1.0 )
		return Inside;

	if ( Number == 0 || !Pressed )
		return Inside;
	//	todo: add border to LocalUv
	float2 FontUv = GetFontUv( Number, LocalUv );
	float FontSample = texture2D( FontTexture, FontUv ).x;
	return mix( MidGrey, FontColour, FontSample );
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
		bool Pressed = true;
		gl_FragColor = float4( GetNumberColour(NeighbourCount,Pressed,LocalUv), 1 );
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


