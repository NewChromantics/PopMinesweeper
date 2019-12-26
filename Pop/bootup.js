Pop.Include = function (Filename)
{
	const Source = Pop.LoadFileAsString(Filename);
	return Pop.CompileAndRun(Source,Filename);
}
Pop.Include('PopEngineCommon/PopMath.js');
Pop.Include('PopEngineCommon/PopShaderCache.js');
Pop.Include('PopEngineCommon/ParamsWindow.js');
Pop.Include('PopEngineCommon/PopFrameCounter.js');

Pop.Include('Minesweeper.js');
Pop.Include('AssetManager.js');


AssetFetchFunctions['Font'] = LoadFontTexture;

function LoadFontTexture(RenderTarget)
{
	function FontCharToPixel(Char)
	{
		switch ( Char )
		{
			case '\n':
			case '\r':
				return undefined;
			case '_':
				return 0;
			case 'X':
				return 255;
			default:
				return 128;
		}
	}
	const FontChars = Pop.LoadFileAsString('Font.txt').split('');
	let FontPixels = FontChars.map( FontCharToPixel );
	FontPixels = FontPixels.filter( x => x!==undefined );
	Pop.Debug(FontPixels);

	const Image = new Pop.Image();
	Image.WritePixels( 3, 5*10, FontPixels, 'Greyscale' );
	return Image;
}


const RenderCounter = new Pop.FrameCounter('Render');

const BlitQuadShader = RegisterShaderAssetFilename('Blit.frag.glsl','Quad.vert.glsl');
const GridQuadShader = RegisterShaderAssetFilename('Grid.frag.glsl','Quad.vert.glsl');

var ResetGameFlag = false;

function OnParamsChanged(Params,ChangedParam)
{
	ResetGameFlag = true;
}

var Params = {};
Params.GridWidth = 10;
Params.GridHeight = 10;
Params.GridMineCount = 4;

var ParamsWindow = CreateParamsWindow(Params, OnParamsChanged);
ParamsWindow.AddParam('GridWidth',1,200,Math.floor);
ParamsWindow.AddParam('GridHeight',1,200,Math.floor);
ParamsWindow.AddParam('GridMineCount',1,500,Math.floor);


//	non-null when changed
var GridPixels = null;
var GridPixelsTexture = new Pop.Image();

function RenderTexture(RenderTarget,Texture,Rect,Uniforms={},ShaderName=BlitQuadShader)
{
	if (!Texture)
		return;

	const Quad = GetAsset('Quad',RenderTarget);
	const Shader = GetAsset(ShaderName,RenderTarget);
	function SetUniforms(Shader)
	{
		Shader.SetUniform('Texture',Texture);
		Shader.SetUniform('VertexRect',Rect);
		
		function SetUniform(Name)
		{
			Shader.SetUniform( Name, Uniforms[Name] );
		}
		Object.keys(Uniforms).forEach( SetUniform );
	}

	RenderTarget.DrawGeometry(Quad,Shader,SetUniforms);
}



//	we need some render context for openvr
const Window = new Pop.Opengl.Window("Minesweeper");
Window.OnRender = function (RenderTarget) 
{
	RenderTarget.ClearColour(0,1,1);
	RenderCounter.Add();

	//	get the game state as a texture
	if ( GridPixels )
	{
		GridPixelsTexture.WritePixels( GridPixels.Width, GridPixels.Height, GridPixels.Pixels, GridPixels.Format );
		GridPixels = null;
	}
	
	//	render game grid with a game shader
	//	in the center
	{
		const RenderTargetRect = RenderTarget.GetScreenRect();
		let w = RenderTargetRect[2];
		let h = RenderTargetRect[3];
		if (w > h)
		{
			w = h / w;
			h = 1;
		}
		else
		{
			h = w / h;
			w = 1;
		}
		let Border = 0.2;
		w -= Border * w;
		h -= Border * h;
		const Rect = [(1 - w) / 2,(1 - h) / 2,w,h];
		const Uniforms = {};
		Uniforms['FontTexture'] = GetAsset('Font',RenderTarget);
		Uniforms['GridSize'] = [Params.GridWidth,Params.GridHeight];
		RenderTexture(RenderTarget,GridPixelsTexture,Rect,Uniforms,GridQuadShader);
	}

	//	todo: show gui
	//	todo: show mouse interaction
		
}
Window.OnMouseMove = function () { };


function OnGameStateChanged(Game)
{
	//	turn the game grid into a pixel map
	const Grid = Game.Map;
	const PixelCount = Grid.length * Grid[0].length;
	const ComponentCount = 4;
	const Pixels = new Uint8Array( new Array(ComponentCount*PixelCount) );
	GridPixels = {};
	GridPixels.Width = Grid.length;
	GridPixels.Height = Grid[0].length;
	GridPixels.Format = 'RGBA';

	for ( let x=0;	x<GridPixels.Width;	x++ )
	{
		for ( let y=0;	y<GridPixels.Height;	y++ )
		{
			let PixelIndex = (y * GridPixels.Width) + x;
			PixelIndex *= ComponentCount;
			const NeighbourCount = Grid[x][y];
			const IsMine = (Grid[x][y]===true);
			//	is flagged, is exploded etc
			Pixels[PixelIndex+0] = NeighbourCount;
			Pixels[PixelIndex+1] = IsMine;
			Pixels[PixelIndex+2] = 0;
			Pixels[PixelIndex+3] = 255;
		}
	}
	GridPixels.Pixels = Pixels;
}

async function AppLoop()
{
	while ( true )
	{
		ResetGameFlag = false;
		const Game = new MinesweeperGame( Params.GridWidth, Params.GridHeight, Params.GridMineCount );
		while ( !ResetGameFlag )
		{
			await Pop.Yield(100);
			await Game.Iteration( OnGameStateChanged );
			if ( Game.IsFinished() )
				break;
		}
	}
}
AppLoop().then(Pop.Debug).catch(Pop.Debug);
