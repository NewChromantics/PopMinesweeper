
function MakeDoubleArray(Width,Height,GetInitCell)
{
	const Grid = new Array(Width);
	for ( let x=0;	x<Grid.length;	x++ )
	{
		Grid[x] = new Array(Height);
		for ( let y=0;	y<Grid[x].length;	y++ )
		{
			Grid[x][y] = GetInitCell(x,y);
		}
	}
	return Grid;
}

function GetAllCoords(Width,Height)
{
	const Coords = [];
	for ( let x=0;	x<Width;	x++ )
		for ( let y=0;	y<Height;	y++ )
			Coords.push( [x,y] );
	return Coords;
}

//	returns true if mine, else neighbour count
function CountNeighbours(ThisCoord,MineCoords)
{
	let NeighbourCount = 0;
	let IsMine = false;
	function CompareCoord(MineCoord)
	{
		const xdiff = Math.abs(ThisCoord[0] - MineCoord[0]);
		const ydiff = Math.abs( ThisCoord[1] - MineCoord[1] );
		if ( xdiff == 0 && ydiff == 0 )
			IsMine = true;
		else if ( xdiff <= 1 && ydiff <= 1 )
			NeighbourCount++;
	}
	MineCoords.forEach( CompareCoord );
	
	//Pop.Debug("ThisCoord",ThisCoord[0],ThisCoord[1]," has " + NeighbourCount, "IsMine="+IsMine);
	
	if ( IsMine )
		return true;
	return NeighbourCount;
}

class MinesweeperGame
{
	constructor(Width,Height,MineCount)
	{
		this.CreateMap(Width,Height,MineCount);
	}
	
	CreateMap(Width,Height,MineCount)
	{
		//	make list of mine positions by making an array of all cords and picking some out
		let AllCoords = GetAllCoords(Width,Height);
		let MineCoords = [];
		for ( let i=0;	i<MineCount;	i++ )
		{
			//	pop random coord
			const RandomIndex = Math.floor( Math.random() * AllCoords.length );
			const RandomCoord = AllCoords.splice( RandomIndex, 1)[0];
			MineCoords.push( RandomCoord );
		}

		//Pop.Debug(MineCoords);
		function InitCell(x,y)
		{
			//	work out if the cell is a number or a mine, or nothing
			const Neighbours = CountNeighbours( [x,y], MineCoords );
			return Neighbours;
		}
		
		this.Map = MakeDoubleArray( Width, Height, InitCell );
		Pop.Debug("Map",this.Map);
	}
	
	IsFinished()
	{
		return false;
	}
	
	//	runs one iteration of the game loop
	async Iteration(OnStateChanged)
	{
		OnStateChanged(this);
	}
}
