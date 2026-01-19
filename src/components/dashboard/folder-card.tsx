// import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Settings, MoreHorizontal } from "lucide-react";
import type { BaseTest } from "@/services/base-test-service";

interface FolderCardProps {
  baseTest: BaseTest;
}

const FolderCard = ({ baseTest }: FolderCardProps) => {
//   const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`baseTests/${baseTest.id}`, {
      state: { folderName: baseTest.type, baseTestCode: baseTest.code }
    });
  };

  const fileCount = 0; // Will be updated when we have actual tests under base test
  const topFile = null;

  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('en-US', {
  //     weekday: 'short',
  //     day: '2-digit',
  //     month: 'short',
  //     year: 'numeric'
  //   });
  // };

  // const formatTime = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleTimeString('en-US', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     hour12: false
  //   });
  // };

  return (
    <div 
      className="relative cursor-pointer group flex flex-col items-center"
      onClick={handleClick}
    >
      <div 
        className="file relative w-60 h-44 origin-bottom"
        style={{ perspective: '1500px' }}
      >
        {/* Back folder layer with tab */}
        <div 
          className="absolute inset-0 folder-gradient rounded-2xl rounded-tl-none transition-all ease duration-300 group-hover:shadow-[0_20px_40px_rgba(0,0,0,.2)]"
          style={{ zIndex: 1 }}
        >
          {/* Folder Tab - back */}
          <div 
            className="absolute bottom-full left-0 w-20 h-4 folder-gradient rounded-t-2xl"
          />
          <div 
            className="absolute -top-[15px] left-[75.5px] w-4 h-4 folder-gradient"
            style={{ clipPath: 'polygon(0 35%, 0% 100%, 50% 100%)' }}
          />
        </div>

        {/* File cards that peek out on hover */}
        <div 
          className="absolute inset-1 bg-white rounded-xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-20deg)]"
          style={{ zIndex: 2 }}
        />
        <div 
          className="absolute inset-1 bg-white rounded-xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-30deg)]"
          style={{ zIndex: 3 }}
        />
        
        {/* Main file card with content */}
        <div 
          className="absolute inset-1 bg-white rounded-xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-38deg)] flex flex-col"
          style={{ zIndex: 4 }}
        >
          {fileCount > 0 && topFile ? (
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {/* {formatDate(topFile.date)} */}
                </span>
                <span className="text-xs text-primary font-semibold px-1.5 py-0.5 bg-primary/10 rounded">
                  {/* {formatTime(topFile.date)} */}
                </span>
              </div>
              <button 
                className="p-1 hover:bg-muted rounded transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center py-3">
              <span className="text-xs text-muted-foreground">No files yet</span>
            </div>
          )}
        </div>

        {/* Front folder layer that opens */}
        <div 
          className="absolute bottom-0 w-full h-[156px] folder-gradient rounded-2xl rounded-tr-none transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-46deg)_translateY(1px)] group-hover:shadow-[inset_0_20px_40px_hsl(var(--folder-gradient-start)),inset_0_-20px_40px_hsl(var(--folder-gradient-end))]"
          style={{ zIndex: 5 }}
        >
          {/* Front Tab */}
          <div 
            className="absolute bottom-full right-0 w-[146px] h-4 folder-gradient rounded-t-2xl"
          />
          <div 
            className="absolute -top-[10px] right-[142px] w-3 h-3 folder-gradient"
            style={{ clipPath: 'polygon(100% 14%, 50% 100%, 100% 100%)' }}
          />
          
          {/* Folder Content */}
          <div className="relative h-full p-4 flex flex-col justify-end">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-foreground">
                  {baseTest.type}
                </h3>
                <p className="text-sm text-primary-foreground/70 mt-0.5">
                  {baseTest.code}
                </p>
              </div>
              
              {/* Action Icons */}
              <div className="flex items-center gap-1">
                <button 
                  className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Lock className="w-4 h-4 text-primary-foreground/80" />
                </button>
                <button 
                  className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Settings className="w-4 h-4 text-primary-foreground/80" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderCard;
